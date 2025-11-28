import express from 'express';
import prisma from '../utils/prisma';

const router = express.Router();

// Get Pending Prescriptions
router.get('/prescriptions', async (req, res) => {
    try {
        const prescriptions = await prisma.prescription.findMany({
            where: { status: 'PENDING' },
            include: {
                opdVisit: {
                    include: { patient: true },
                },
            },
        });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
});

// Dispense Medicine
router.post('/dispense/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const prescription = await prisma.prescription.update({
            where: { id },
            data: { status: 'DISPENSED' },
        });
        res.json(prescription);
    } catch (error) {
        res.status(500).json({ error: 'Failed to dispense' });
    }
});

export default router;
