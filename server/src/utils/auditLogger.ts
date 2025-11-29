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

        // Check if we are in a tenant context
        if (req.tenantClient) {
            // Tenant-level audit log
            await req.tenantClient.auditLog.create({
                data: {
                    action,
                    actorId,
                    details: JSON.stringify({ role, targetId, ...details }),
                },
            });
        } else {
            // Platform-level audit log (Super Admin actions)
            // Note: Schema has PlatformAuditLog for public schema
            await prisma.platformAuditLog.create({
                data: {
                    action,
                    actorId,
                    actorType: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'SYSTEM',
                    details: JSON.stringify({ role, targetId, ...details }),
                },
            });
        }
    } catch (error) {
        console.error('Failed to record audit log', error);
    }
};