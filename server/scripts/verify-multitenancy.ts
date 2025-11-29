import prisma, { getTenantClient } from '../src/utils/prisma';
import { createTenantSchema, runMigrationsForTenant } from '../src/utils/schemaManager';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('🚀 Starting Multi-tenancy Verification...');

    const licenseNumber = 'TEST-PHC-001';
    const adminEmail = 'admin@testphc.com';
    const adminPassword = 'password123';
    const schemaName = 'phc_test_001';

    try {
        // 1. Clean up previous test data
        console.log('🧹 Cleaning up...');
        await prisma.pHC.deleteMany({ where: { licenseNumber } });
        await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);

        // 2. Create PHC
        console.log('🏥 Creating PHC...');
        const phc = await prisma.pHC.create({
            data: {
                name: 'Test PHC',
                address: '123 Test St',
                contactNumber: '1234567890',
                licenseNumber,
                adminEmail,
                status: 'ACTIVE',
                schemaName,
            },
        });
        console.log(`✅ PHC Created: ${phc.id}`);

        // 3. Create Schema & Migrations
        console.log('🏗️ Creating Schema...');
        await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
        await runMigrationsForTenant(schemaName);
        console.log('✅ Schema Created & Migrated');

        // 4. Create Admin User in Tenant
        console.log('👤 Creating Tenant Admin...');
        const tenantClient = getTenantClient(schemaName);
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const user = await tenantClient.user.create({
            data: {
                name: 'Test Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
        console.log(`✅ Tenant Admin Created: ${user.id}`);

        // 5. Verify Data Isolation
        console.log('🔒 Verifying Data Isolation...');

        // Create a patient in this tenant
        const patient = await tenantClient.patient.create({
            data: {
                name: 'Test Patient',
                age: 30,
                gender: 'Male',
                phone: '555-0101',
            }
        });
        console.log(`✅ Patient Created in ${schemaName}: ${patient.id}`);

        // Create another tenant to verify isolation
        const schemaName2 = 'phc_test_002';
        await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName2}" CASCADE`);
        await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName2}"`);
        await runMigrationsForTenant(schemaName2);

        const tenantClient2 = getTenantClient(schemaName2);

        // Try to find the patient from tenant 1 in tenant 2
        const patientInTenant2 = await tenantClient2.patient.findUnique({
            where: { id: patient.id }
        });

        if (patientInTenant2) {
            console.error('❌ Data Isolation FAILED: Patient visible in other tenant!');
            process.exit(1);
        } else {
            console.log('✅ Data Isolation Verified: Patient NOT visible in other tenant.');
        }

        // Clean up
        await prisma.pHC.deleteMany({ where: { licenseNumber } });
        await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
        await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName2}" CASCADE`);

        console.log('🎉 Verification Successful!');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
