import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createTenantSchema, runMigrationsForTenant } from '../src/utils/schemaManager';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting multi-tenancy seed...\n');

    // 1. Create Super Admin
    console.log('👤 Creating Super Admin...');
    const hashedSuperAdminPassword = await bcrypt.hash('SuperAdmin@123', 10);

    const superAdmin = await prisma.superAdmin.upsert({
        where: { email: 'superadmin@phc-platform.com' },
        update: {},
        create: {
            email: 'superadmin@phc-platform.com',
            password: hashedSuperAdminPassword,
            name: 'Platform Super Admin',
        },
    });
    console.log(`✅ Super Admin created: ${superAdmin.email}\n`);

    // 2. Create Demo PHC
    console.log('🏥 Creating Demo PHC...');
    const demoPHC = await prisma.pHC.upsert({
        where: { licenseNumber: 'PHC-DEMO-001' },
        update: {},
        create: {
            name: 'Demo Primary Health Centre',
            address: '123 Health Street, Demo City, Demo State - 123456',
            contactNumber: '+91-9876543210',
            licenseNumber: 'PHC-DEMO-001',
            adminEmail: 'admin@demo.phc.com',
            status: 'ACTIVE',
            schemaName: 'phc_demo',
        },
    });
    console.log(`✅ PHC created: ${demoPHC.name}`);
    console.log(`   Schema: ${demoPHC.schemaName}\n`);

    // 3. Create tenant schema and tables
    console.log('🔧 Setting up tenant schema...');
    await createTenantSchema('demo');
    await runMigrationsForTenant('phc_demo');
    console.log('✅ Tenant schema ready\n');

    // 4. Seed tenant data (users)
    console.log('👥 Seeding demo PHC users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const users = [
        { name: 'Admin User', email: 'admin@demo.phc.com', role: 'ADMIN' },
        { name: 'Dr. Demo Doctor', email: 'doctor@demo.phc.com', role: 'DOCTOR' },
        { name: 'Nurse Demo', email: 'nurse@demo.phc.com', role: 'NURSE' },
        { name: 'Lab Tech Demo', email: 'lab@demo.phc.com', role: 'LAB_TECH' },
        { name: 'Pharmacist Demo', email: 'pharma@demo.phc.com', role: 'PHARMACIST' },
    ];

    for (const user of users) {
        await prisma.$executeRawUnsafe(`
            INSERT INTO "phc_demo"."User" (id, email, password, name, role, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())
            ON CONFLICT (email) DO NOTHING
        `, user.email, hashedPassword, user.name, user.role);
        console.log(`   ✅ ${user.role}: ${user.email}`);
    }

    console.log('\n🎉 Seeding completed successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Super Admin: superadmin@phc-platform.com / SuperAdmin@123');
    console.log('   PHC Admin: admin@demo.phc.com / admin123');
    console.log('   Doctor: doctor@demo.phc.com / admin123');
    console.log('   Nurse: nurse@demo.phc.com / admin123');
    console.log('   Lab Tech: lab@demo.phc.com / admin123');
    console.log('   Pharmacist: pharma@demo.phc.com / admin123\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
