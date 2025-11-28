import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { recordAudit } from '../utils/auditLogger';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// All admin routes are protected by requireRole(['ADMIN']) in app.ts

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create user
router.post('/users', async (req: AuthRequest, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role },
        });
        await recordAudit(req, 'USER_CREATED', user.id, { role });
        res.status(201).json({ message: 'User created', userId: user.id });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
});

export default router;
