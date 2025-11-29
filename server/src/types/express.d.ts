import { PrismaClient } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            prisma: PrismaClient;
            user?: {
                userId: string;
                role: string;
                name: string;
                schemaName?: string;
                phcId?: string;
            };
            phc?: {
                id: string;
                schemaName: string;
            };
        }
    }
}
