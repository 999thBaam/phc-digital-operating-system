import express from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { recordAudit } from '../utils/auditLogger';

const router = express.Router();

// Get Pending Lab Orders
router.get('/orders', async (req: AuthRequest, res) => {
    try {
        const orders = await req.tenantClient.labOrder.findMany({
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
router.post('/complete/:id', async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { result } = req.body;

    try {
        const order = await req.tenantClient.labOrder.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                result,
            },
        });
        await recordAudit(req, 'LAB_ORDER_COMPLETED', id, { opdVisitId: order.opdVisitId });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete order' });
    }
});

export default router;
