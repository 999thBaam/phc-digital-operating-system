import { Response, NextFunction } from 'express';
import { getTenantClient } from '../utils/prisma';
import { AuthRequest } from './auth';

/**
 * Middleware to resolve the tenant and attach the tenant-specific Prisma client to the request.
 * Assumes authentication middleware has already run and populated req.user.
 */
export const tenantMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Check if user is authenticated and has a schemaName
    if (!req.user || !req.user.schemaName) {
        return res.status(401).json({ error: 'Unauthorized: No tenant context' });
    }

    const { schemaName } = req.user;

    try {
        // 2. Get the tenant-specific Prisma client
        const tenantClient = getTenantClient(schemaName);

        // 3. Attach to request
        req.tenantClient = tenantClient;

        next();
    } catch (error) {
        console.error('Failed to initialize tenant client:', error);
        res.status(500).json({ error: 'Internal server error: Tenant connection failed' });
    }
};
