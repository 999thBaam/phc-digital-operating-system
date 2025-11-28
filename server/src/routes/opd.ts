import express from 'express';
import prisma from '../utils/prisma';

const router = express.Router();

// Create OPD Token (Visit)
router.post('/visit', async (req, res) => {
    const { patientId, symptoms } = req.body;

    try {
        // Get today's token count
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await prisma.oPDVisit.count({
            where: {
                createdAt: {
                    gte: today,
                },
            },
        });

        const tokenNo = count + 1;

        const visit = await prisma.oPDVisit.create({
            data: {
                patientId,
                tokenNo,
                status: 'WAITING',
                symptoms,
            },
        });

        res.status(201).json(visit);
    } catch (error) {
        res.status(400).json({ error: 'Failed to generate token' });
    }
});

// Get OPD Queue
router.get('/queue', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const queue = await prisma.oPDVisit.findMany({
            where: {
                createdAt: { gte: today },
                status: { not: 'COMPLETED' },
            },
            include: {
                patient: true,
            },
            orderBy: {
                tokenNo: 'asc',
            },
        });
        res.json(queue);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch queue' });
    }
});

// Complete Consultation
router.post('/consult/:id', async (req, res) => {
    const { id } = req.params;
    const { vitals, diagnosis, prescription, labTests } = req.body;

    try {
        const visit = await prisma.oPDVisit.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                weight: vitals.weight ? parseFloat(vitals.weight) : null,
                bp: vitals.bp,
                temp: vitals.temp ? parseFloat(vitals.temp) : null,
                diagnosis,
            },
        });

        // Create prescription if provided
        if (prescription) {
            await prisma.prescription.create({
                data: {
                    opdVisitId: id,
                    medicine: prescription,
                    dosage: '',
                    status: 'PENDING',
                },
            });
        }

        // Create lab orders if provided
        if (labTests && Array.isArray(labTests) && labTests.length > 0) {
            await prisma.labOrder.createMany({
                data: labTests.map((testName: string) => ({
                    opdVisitId: id,
                    testName,
                    status: 'PENDING',
                })),
            });
        }

        res.json(visit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete consultation' });
    }
});

export default router;
