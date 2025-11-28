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
   cd "Sanjeevani OS"
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

- **Email**: admin@phc.com
- **Password**: admin123
- **Role**: ADMIN

## Usage

1. **Login** at http://localhost:5173/login
2. **Admin** can create users for different roles
3. **Nurse/Reception** registers patients and generates OPD tokens
4. **Doctor** views queue, consults patients, prescribes medicines, orders tests
5. **Lab Tech** views pending tests and uploads results
6. **Pharmacist** dispenses medicines
7. **Nurse/Admin** manages bed admissions and discharges

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
