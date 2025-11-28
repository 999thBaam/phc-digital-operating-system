import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

const router = express.Router();

// Middleware to check if user is admin (simplified for MVP)
const isAdmin = async (req: any, res: any, next: any) => {
    // In a real app, verify JWT and check role here.
    // For now, we assume the auth middleware (to be added) handles user attachment
    // But since we haven't added auth middleware globally yet, we'll skip for now or add a basic check if we had the user.
    // We'll implement a proper auth middleware next.
    next();
};

// Get all users
router.get('/users', isAdmin, async (req, res) => {
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
router.post('/users', isAdmin, async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role },
        });
        res.status(201).json({ message: 'User created', userId: user.id });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
});

export default router;
