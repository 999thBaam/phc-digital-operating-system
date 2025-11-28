import express from 'express';
import prisma from '../utils/prisma';

const router = express.Router();

// Get Pending Lab Orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await prisma.labOrder.findMany({
            where: { status: 'PENDING' },
            include: {
                opdVisit: {
                    include: { patient: true },
                },
            },
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Complete Lab Order (Upload Result)
router.post('/complete/:id', async (req, res) => {
    const { id } = req.params;
    const { result } = req.body;

    try {
        const order = await prisma.labOrder.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                result,
            },
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete order' });
    }
});

export default router;
