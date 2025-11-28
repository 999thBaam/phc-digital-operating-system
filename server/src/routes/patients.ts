import express from 'express';
import prisma from '../utils/prisma';

const router = express.Router();

// Search patients
router.get('/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);

    try {
        const patients = await prisma.patient.findMany({
            where: {
                OR: [
                    { name: { contains: String(query) } }, // Removed mode: 'insensitive' for SQLite compatibility if needed, but Prisma usually handles it.
                    // SQLite default collation is case-insensitive for ASCII, but let's keep it simple.
                    { phone: { contains: String(query) } },
                ],
            },
            take: 10,
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// Create patient
router.post('/', async (req, res) => {
    const { name, age, gender, phone, address } = req.body;
    try {
        const patient = await prisma.patient.create({
            data: { name, age: Number(age), gender, phone, address },
        });
        res.status(201).json(patient);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create patient' });
    }
});

export default router;
