# 🚀 Quick Start Guide

## ✅ Status: READY TO USE

Your PHC Digital Operating System is fully configured with Supabase PostgreSQL and multi-tenancy!

---

## 🎯 How to Start

### 1. Start Backend Server
```bash
cd server
npm run dev
```
✅ Server runs on: **http://localhost:3000**

### 2. Start Frontend Client (New Terminal)
```bash
cd client
npm run dev
```
✅ Client runs on: **http://localhost:5173**

---

## 🔐 Login Credentials

### Super Admin (Platform Management)
- **URL:** http://localhost:5173
- **Email:** `superadmin@phc-platform.com`
- **Password:** `SuperAdmin@123`
- **License:** Leave empty
- **Access:** PHC Management Dashboard

### Demo PHC (PHC-DEMO-001)
- **URL:** http://localhost:5173
- **License:** `PHC-DEMO-001`
- **Email:** Choose any role below
- **Password:** `admin123` (same for all)

**Available Roles:**
- 👨‍💼 **Admin:** `admin@demo.phc.com`
- 👨‍⚕️ **Doctor:** `doctor@demo.phc.com`
- 👩‍⚕️ **Nurse:** `nurse@demo.phc.com`
- 🔬 **Lab Tech:** `lab@demo.phc.com`
- 💊 **Pharmacist:** `pharma@demo.phc.com`

---

## 🎨 Super Admin Features

1. **View All PHCs** - See list of all registered PHCs
2. **Create New PHC** - Onboard new health centres
3. **Manage Status** - Activate, Suspend, or Deactivate PHCs
4. **Monitor Activity** - View platform statistics

---

## 🏥 PHC Features (Tenant)

1. **Patient Registration** - Register new patients with vitals
2. **OPD Management** - Generate tokens, manage queue
3. **Doctor Consultation** - Diagnose, prescribe, order tests
4. **Lab Management** - Process tests, upload results
5. **Pharmacy** - Dispense medicines
6. **Bed Management** - Admit and discharge patients
7. **Reports** - View analytics and reports

---

## ✅ Verified Features

- ✅ Multi-tenant architecture (schema per PHC)
- ✅ Complete data isolation between PHCs
- ✅ Super Admin authentication
- ✅ Tenant user authentication
- ✅ Role-based access control
- ✅ Supabase PostgreSQL connection
- ✅ All migrations applied
- ✅ Demo data seeded

---

## 🧪 Test the System

### Create a New PHC (as Super Admin)
1. Login as Super Admin
2. Click **"Create New PHC"**
3. Fill in the form:
   - PHC Name: `Sunrise Health Centre`
   - License: `PHC-TEST-2025`
   - Address: `123 Main St, Delhi`
   - Contact: `9876543210`
   - Admin Email: `admin@sunrise.phc.com`
   - Admin Name: `Dr. Rajesh Kumar`
   - Password: `test123`
4. Click **"Create PHC"**
5. New PHC appears in the list!

### Login to New PHC
1. Logout from Super Admin
2. Login with:
   - License: `PHC-TEST-2025`
   - Email: `admin@sunrise.phc.com`
   - Password: `test123`
3. Access the PHC Dashboard!

---

## 📚 Documentation

- 📖 [Full Walkthrough](file:///.gemini/antigravity/brain/900cf4af-29f8-42d8-9fa9-f718a9623bdb/walkthrough.md)
- 🗄️ [Supabase Setup](file:///SUPABASE_SETUP.md)
- 🏗️ [Multi-Tenancy Guide](file:///MULTITENANCY_SETUP.md)
- 📘 [Main README](file:///README.md)

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill process if needed
kill -9 <PID>
```

### Client won't start
```bash
# Check if port 5173 is in use
lsof -i :5173
# Kill process if needed
kill -9 <PID>
```

### Database connection issues
- Verify `.env` file exists in `server/` directory
- Check Supabase project is active
- Verify connection string in `.env`

---

## 💡 Development Tips

### Reset Database (Fresh Start)
```bash
cd server
npx prisma migrate reset
npx ts-node prisma/seed.ts
```

### View Database in Supabase
1. Go to https://supabase.com
2. Open your project
3. Click **"Database"** → **"Table Editor"**
4. See all schemas and tables!

### Run Verification Test
```bash
cd server
npx ts-node scripts/verify-multitenancy.ts
```

---

## 🎉 You're All Set!

Your multi-tenant PHC Digital Operating System is ready to use. Start by logging in as Super Admin and creating your first PHC!

**Happy Coding! 🚀**
