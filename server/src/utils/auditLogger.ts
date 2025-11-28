import prisma from './prisma';
import { AuthRequest } from '../middleware/auth';

export const recordAudit = async (
    req: AuthRequest,
    action: string,
    targetId?: string,
    details: Record<string, unknown> = {}
) => {
    try {
        const actorId = req.user?.userId || 'anonymous';
        const role = req.user?.role || 'UNKNOWN';

        await prisma.auditLog.create({
            data: {
                action,
                actorId,
                details: JSON.stringify({ role, targetId, ...details }),
            },
        });
    } catch (error) {
        console.error('Failed to record audit log', error);
    }
};
