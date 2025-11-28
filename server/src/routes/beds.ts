import express from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { recordAudit } from '../utils/auditLogger';

const router = express.Router();

// Get All Beds
router.get('/', async (req, res) => {
    try {
        const beds = await prisma.bed.findMany({
            include: {
                admissions: {
                    where: { status: 'ADMITTED' },
                    include: { patient: true },
                },
            },
            orderBy: { number: 'asc' },
        });
        res.json(beds);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch beds' });
    }
});

// Initialize Beds (One-time setup, or admin action)
router.post('/init', async (req: AuthRequest, res) => {
    try {
        // Create 5 beds if not exist
        const count = await prisma.bed.count();
        if (count === 0) {
            for (let i = 1; i <= 5; i++) {
                await prisma.bed.create({ data: { number: `Bed ${i}` } });
            }
        }
        await recordAudit(req, 'BED_INIT', undefined, { created: count === 0 ? 5 : 0 });
        res.json({ message: 'Beds initialized' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to init beds' });
    }
});

// Admit Patient
router.post('/admit', async (req: AuthRequest, res) => {
    const { patientId, bedId } = req.body;
    try {
        await prisma.$transaction([
            prisma.bed.update({ where: { id: bedId }, data: { isOccupied: true } }),
            prisma.admission.create({
                data: {
                    patientId,
                    bedId,
                    status: 'ADMITTED',
                },
            }),
        ]);
        await recordAudit(req, 'PATIENT_ADMITTED', bedId, { patientId });
        res.json({ message: 'Admitted' });
    } catch (error) {
        res.status(500).json({ error: 'Admission failed' });
    }
});

// Discharge Patient
router.post('/discharge/:bedId', async (req: AuthRequest, res) => {
    const { bedId } = req.params;
    try {
        // Find active admission for this bed
        const admission = await prisma.admission.findFirst({
            where: { bedId, status: 'ADMITTED' },
        });

        if (!admission) return res.status(400).json({ error: 'No active admission' });

        await prisma.$transaction([
            prisma.bed.update({ where: { id: bedId }, data: { isOccupied: false } }),
            prisma.admission.update({
                where: { id: admission.id },
                data: { status: 'DISCHARGED', dischargedAt: new Date() },
            }),
        ]);
        await recordAudit(req, 'PATIENT_DISCHARGED', bedId, { patientId: admission.patientId });
        res.json({ message: 'Discharged' });
    } catch (error) {
        res.status(500).json({ error: 'Discharge failed' });
    }
});

export default router;
