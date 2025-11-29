import express from 'express';
import bcrypt from 'bcryptjs';
import prisma, { getTenantClient } from '../utils/prisma';
import { createTenantSchema, runMigrationsForTenant } from '../utils/schemaManager';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create new PHC
router.post('/phc', async (req: AuthRequest, res) => {
    const { name, address, contactNumber, licenseNumber, adminEmail, adminName, adminPassword } = req.body;

    try {
        // 1. Create PHC record in public schema
        // We need to generate a schema name first or let the manager do it?
        // The manager takes phcId. So we need PHC ID first.
        // But we want to store schemaName in PHC record.
        // So:
        // a. Generate UUID for PHC (Prisma does it, but we need it for schema name).
        //    Actually, we can just use a random string or let Prisma generate ID and then update?
        //    Or generate ID manually?
        //    Let's use a transaction or just create PHC with a temporary schema name or generate one based on license?
        //    Let's use license number for schema name part to be deterministic?
        //    Or just generate a UUID for the ID first?
        //    Prisma's `create` returns the ID.

        // Let's create PHC first with a placeholder schema name (or generate one).
        const schemaName = `phc_${licenseNumber.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;

        // Check if license exists
        const existing = await prisma.pHC.findUnique({ where: { licenseNumber } });
        if (existing) {
            return res.status(400).json({ error: 'PHC with this license already exists' });
        }

        const phc = await prisma.pHC.create({
            data: {
                name,
                address,
                contactNumber,
                licenseNumber,
                adminEmail,
                status: 'ACTIVE', // Auto-activate for now
                schemaName,
            },
        });

        // 2. Create Tenant Schema
        await createTenantSchema(phc.id); // Wait, createTenantSchema uses phcId to generate name?
        // In schemaManager.ts: const schemaName = `phc_${phcId.replace(/-/g, '_')}`;
        // Ah, schemaManager generates name based on ID.
        // But I stored `schemaName` in DB based on license above.
        // I should align them.
        // Let's modify schemaManager or just use the one I generated.
        // Actually, `createTenantSchema` returns the name it generated.
        // But I need to store it in DB *during* creation if it's required.
        // Or I can update it after.
        // Let's just use the logic from schemaManager manually here or update schemaManager to accept a name.
        // `createTenantSchema` takes `phcId`.
        // Let's just use `phc.id` to generate the name, update the PHC record with it, then create schema.

        // REVISION:
        // 1. Create PHC with a temporary schema name (or make it optional? It's @unique so must be unique).
        //    Let's use the license-based one I generated above.
        // 2. Call `createTenantSchema`? No, `createTenantSchema` generates its own name.
        //    I should probably just run the raw SQL here or update `createTenantSchema` to take a name.
        //    Let's assume I'll update `createTenantSchema` to take a name, OR just use `phc.schemaName`.

        // Let's do this:
        // 1. Create PHC.
        // 2. Create Schema using `phc.schemaName`.
        // 3. Run Migrations.
        // 4. Create Admin User in Tenant.

        await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
        console.log(`✅ Created schema: ${schemaName}`);

        await runMigrationsForTenant(schemaName);

        // 3. Create Admin User in Tenant Schema
        const tenantClient = getTenantClient(schemaName);
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

        await tenantClient.user.create({
            data: {
                name: adminName,
                email: adminEmail,
                password: hashedAdminPassword,
                role: 'ADMIN',
            },
        });

        res.status(201).json({ message: 'PHC created successfully', phcId: phc.id, schemaName });

    } catch (error) {
        console.error('Failed to create PHC:', error);
        res.status(500).json({ error: 'Failed to create PHC' });
    }
});

// List PHCs
router.get('/phc', async (req: AuthRequest, res) => {
    try {
        const phcs = await prisma.pHC.findMany();
        res.json(phcs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch PHCs' });
    }
});

// Update PHC Status
router.patch('/phc/:id/status', async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status, adminPassword } = req.body;

    try {
        const phc = await prisma.pHC.findUnique({ where: { id } });

        if (!phc) {
            return res.status(404).json({ error: 'PHC not found' });
        }

        // If activating a PHC, provision the schema and admin user
        if (status === 'ACTIVE' && phc.status !== 'ACTIVE') {
            // Check if admin password is provided
            if (!adminPassword) {
                return res.status(400).json({
                    error: 'Admin password is required when activating a PHC'
                });
            }

            // Create schema
            await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${phc.schemaName}"`);
            console.log(`✅ Created schema: ${phc.schemaName}`);

            // Run migrations
            await runMigrationsForTenant(phc.schemaName);

            // Create admin user
            const tenantClient = getTenantClient(phc.schemaName);
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            await tenantClient.user.create({
                data: {
                    name: 'PHC Admin',
                    email: phc.adminEmail,
                    password: hashedPassword,
                    role: 'ADMIN',
                },
            });

            console.log(`✅ PHC ${phc.name} activated with schema ${phc.schemaName}`);
        }

        // Update status
        const updatedPhc = await prisma.pHC.update({
            where: { id },
            data: { status },
        });

        res.json(updatedPhc);
    } catch (error) {
        console.error('Failed to update PHC status:', error);
        res.status(500).json({ error: 'Failed to update PHC status' });
    }
});

export default router;
