import express from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { recordAudit } from '../utils/auditLogger';

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
router.post('/dispense/:id', async (req: AuthRequest, res) => {
    const { id } = req.params;

    try {
        const prescription = await prisma.prescription.update({
            where: { id },
            data: { status: 'DISPENSED' },
        });
        await recordAudit(req, 'PRESCRIPTION_DISPENSED', id, { opdVisitId: prescription.opdVisitId });
        res.json(prescription);
    } catch (error) {
        res.status(500).json({ error: 'Failed to dispense' });
    }
});

export default router;
