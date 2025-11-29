# Multi-Tenancy Setup Guide

## Prerequisites
- Docker Desktop installed and running
- Node.js 18+

## Step 1: Start PostgreSQL

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker ps
```

## Step 2: Update Environment

Copy `.env.example` to `.env` and update if needed:

```bash
cd server
cp .env.example .env
```

## Step 3: Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init_multitenancy

# This will create the 'public' schema with platform tables
```

## Step 4: Seed Platform Data

```bash
# Seed Super Admin and demo PHC
npx ts-node prisma/seed.ts
```

## Architecture

### Database Structure
```
phc_platform (PostgreSQL Database)
├── public schema (Platform data)
│   ├── phc (PHC registry)
│   ├── super_admin (Platform admins)
│   └── platform_audit_log
│
├── phc_<uuid> schemas (Per-PHC data)
│   ├── User
│   ├── Patient
│   ├── OPDVisit
│   ├── LabOrder
│   ├── Prescription
│   ├── Bed
│   ├── Admission
│   └── AuditLog
```

### Schema Isolation
- Each PHC operates in its own PostgreSQL schema
- Complete data isolation - no cross-PHC queries possible
- Platform-level operations use `public` schema
- Tenant operations use `phc_<uuid>` schema

## Default Credentials

### Super Admin
- Email: `superadmin@phc-platform.com`
- Password: `SuperAdmin@123`

### Demo PHC
- Name: Demo Primary Health Centre
- License: PHC-DEMO-001
- Schema: `phc_demo`

### Demo PHC Users
- Admin: `admin@demo.phc.com` / `admin123`
- Doctor: `doctor@demo.phc.com` / `admin123`
- Nurse: `nurse@demo.phc.com` / `admin123`
- Lab Tech: `lab@demo.phc.com` / `admin123`
- Pharmacist: `pharma@demo.phc.com` / `admin123`

## Troubleshooting

### PostgreSQL not starting
```bash
# Check logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Migration errors
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Then re-run migrations
npx prisma migrate dev
```

### Connection refused
- Ensure Docker is running
- Check port 5432 is not in use: `lsof -i :5432`
