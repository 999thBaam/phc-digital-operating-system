import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PHCStatus } from '@prisma/client';
import prisma, { getTenantClient } from '../utils/prisma';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Public PHC Registration
router.post('/register-phc', async (req, res) => {
    const { name, address, contactNumber, licenseNumber, adminEmail, adminName, adminPassword } = req.body;

    try {
        // Check if license number already exists
        const existing = await prisma.pHC.findUnique({ where: { licenseNumber } });
        if (existing) {
            return res.status(400).json({ error: 'A PHC with this license number already exists' });
        }

        // Create PHC with PENDING status
        const schemaName = `phc_${licenseNumber.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;

        const phc = await prisma.pHC.create({
            data: {
                name,
                address,
                contactNumber,
                licenseNumber,
                adminEmail,
                status: 'PENDING', // Requires Super Admin approval
                schemaName,
            },
        });

        // Hash admin password for later use (store temporarily or send via email)
        // For now, we'll store it in a comment or separate table
        // In production, you'd send an email with activation link

        res.status(201).json({
            message: 'PHC registration submitted successfully. Awaiting approval.',
            phcId: phc.id
        });
    } catch (error) {
        console.error('PHC registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Register (Super Admin only in real app, but keeping for now if needed, though strictly we should use Super Admin routes)
// We will modify this to be a "Super Admin" registration or just disable it?
// For now, let's keep it simple and focus on Login.
// Actually, the previous register was for "User". But "User" now belongs to a tenant.
// So we can't register a user without a tenant.
// We'll comment it out or remove it, as user creation should happen via Admin panel.
// But we might need a way to create the FIRST Super Admin? Seed script does that.

// Login
router.post('/login', async (req, res) => {
    const { email, password, licenseNumber } = req.body;

    try {
        let user;
        let role;
        let schemaName;
        let phcId;

        if (licenseNumber) {
            // 1. Tenant Login
            // Find PHC by license number
            const phc = await prisma.pHC.findUnique({
                where: { licenseNumber },
            });

            if (!phc) {
                return res.status(401).json({ error: 'Invalid PHC License Number' });
            }

            // Check PHC status
            if (phc.status === PHCStatus.PENDING) {
                return res.status(403).json({
                    error: 'Your PHC application is pending approval. Please wait for Super Admin to activate your account.'
                });
            }

            if (phc.status === PHCStatus.SUSPENDED) {
                return res.status(403).json({ error: 'Your PHC account has been suspended. Please contact support.' });
            }

            if (phc.status === PHCStatus.INACTIVE) {
                return res.status(403).json({ error: 'Your PHC account is inactive. Please contact support.' });
            }

            if (phc.status !== PHCStatus.ACTIVE && phc.status !== PHCStatus.VERIFIED) {
                return res.status(403).json({ error: 'PHC account is not active' });
            }

            schemaName = phc.schemaName;
            phcId = phc.id;

            // Connect to tenant schema
            const tenantClient = getTenantClient(schemaName);

            // Find user in tenant schema
            try {
                user = await tenantClient.user.findUnique({ where: { email } });
            } catch (schemaError: any) {
                // Handle case where schema doesn't exist (e.g., PHC not fully provisioned)
                if (schemaError.code === 'P2021') {
                    return res.status(500).json({
                        error: 'PHC database schema not found. Please contact Super Admin to complete PHC setup.'
                    });
                }
                throw schemaError; // Re-throw if it's a different error
            }
        } else {
            // 2. Super Admin Login
            user = await prisma.superAdmin.findUnique({ where: { email } });
            role = 'SUPER_ADMIN'; // SuperAdmin table doesn't have role field, implicit
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // For tenant user, role comes from DB. For Super Admin, it's fixed.
        const userRole = licenseNumber ? (user as any).role : 'SUPER_ADMIN';

        const token = jwt.sign(
            {
                userId: user.id,
                role: userRole,
                name: user.name,
                schemaName, // Undefined for Super Admin
                phcId       // Undefined for Super Admin
            },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: userRole,
                email: user.email,
                schemaName,
                phcId
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
