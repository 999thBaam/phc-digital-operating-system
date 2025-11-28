# PHC Digital Operating System (PHC-DOS)

A comprehensive digital management system for Primary Health Care Centres.

## Features

- **Patient Registration & OPD Token Management**
- **Doctor Consultation with Vitals & Prescriptions**
- **Lab Test Orders & Results**
- **Pharmacy Prescription Dispensing**
- **Bed Management (Admission/Discharge)**
- **Role-Based Access Control** (Admin, Doctor, Nurse, Lab Tech, Pharmacist)
- **Real-Time Updates** (Polling-based)

## Tech Stack

### Frontend
- React + Vite
- TypeScript
- Tailwind CSS
- React Router

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite (dev) / PostgreSQL (prod)
- JWT Authentication

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. **Clone and Navigate**
   ```bash
   cd phc-digital-operating-system
   ```

2. **Server Setup**
   ```bash
   cd server
   npm install
   npx prisma migrate dev --name init
   npx ts-node --transpile-only prisma/seed.ts
   npm run dev
   ```

3. **Client Setup** (in a new terminal)
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Initialize Beds** (one-time)
   ```bash
   curl -X POST http://localhost:3000/api/beds/init \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   (Or login as admin and beds will auto-initialize on first access)

## Default Credentials

All demo users share the same password `admin123` so you can quickly log in with the correct role:

- **Admin**: `admin@phc.com`
- **Doctor**: `doctor@phc.com`
- **Nurse/Reception**: `nurse@phc.com`
- **Lab Technician**: `lab@phc.com`
- **Pharmacist**: `pharma@phc.com`

## Usage

1. **Login** at http://localhost:5173/login
2. **Admin** can create users for different roles
3. **Nurse/Reception** registers patients and generates OPD tokens
4. **Doctor** views queue, consults patients, prescribes medicines, orders tests
5. **Lab Tech** views pending tests and uploads results
6. **Pharmacist** dispenses medicines
7. **Nurse/Admin** manages bed admissions and discharges

### How login and roles work
- All users (doctor, nurse, lab tech, pharmacist, admin) authenticate through the same **POST /api/auth/login** endpoint. The server signs a JWT that embeds the user id, name, and **role** in the token payload. When the token is presented, Express middleware (`authenticateToken`) verifies it and attaches the decoded role to the request so downstream handlers know who is calling.
- Each feature router is wrapped with `requireRole([...])`, which checks the decoded role and only allows the permitted roles to proceed (for example, lab routes allow `ADMIN`, `LAB_TECH`, or `DOCTOR`, while pharmacy routes allow `ADMIN` or `PHARMACIST`). The shared login path plus per-route guards ensure every role uses the same login flow but is constrained to the right capabilities.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

### Admin
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user

### Patients
- `GET /api/patients/search?query=` - Search patients
- `POST /api/patients` - Create patient

### OPD
- `POST /api/opd/visit` - Generate token
- `GET /api/opd/queue` - Get queue
- `POST /api/opd/consult/:id` - Complete consultation

### Lab
- `GET /api/lab/orders` - Get pending orders
- `POST /api/lab/complete/:id` - Upload result

### Pharmacy
- `GET /api/pharmacy/prescriptions` - Get pending prescriptions
- `POST /api/pharmacy/dispense/:id` - Dispense medicine

### Beds
- `GET /api/beds` - Get all beds
- `POST /api/beds/init` - Initialize beds
- `POST /api/beds/admit` - Admit patient
- `POST /api/beds/discharge/:bedId` - Discharge patient

## Project Structure

```
Sanjeevani OS/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # Role-specific components
│   │   ├── context/     # Auth context
│   │   ├── pages/       # Login, Dashboard
│   │   └── App.tsx
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth middleware
│   │   └── utils/       # Prisma client
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
└── README.md
```

## License

MIT
