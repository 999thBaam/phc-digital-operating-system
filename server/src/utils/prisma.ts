import { PrismaClient } from '@prisma/client';

// Default client for platform-level operations (public schema)
const prisma = new PrismaClient();

// Cache for tenant clients to avoid exhausting connection pool
const tenantClients: Record<string, PrismaClient> = {};

/**
 * Gets or creates a Prisma Client for a specific tenant schema
 * @param schemaName - The schema name (e.g., "phc_abc123")
 * @returns PrismaClient connected to the tenant schema
 */
export const getTenantClient = (schemaName: string): PrismaClient => {
    if (tenantClients[schemaName]) {
        return tenantClients[schemaName];
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not defined');
    }

    // Append schema to connection string
    // Handle existing query parameters
    const url = new URL(databaseUrl);
    url.searchParams.set('schema', schemaName);

    // Also ensure public is in search path for shared tables if needed, 
    // though we usually access shared tables via the platform client.
    // But if we need cross-schema access in one query, we might need it.
    // For now, strict isolation: tenant client only sees tenant schema + public (if default search path allows).
    // Postgres default search path usually includes "$user", public.
    // Setting ?schema=xyz overrides it to just xyz usually, unless we specify multiple.
    // Prisma only supports one schema in the connection string param usually.
    // Let's stick to setting the schema param which sets the default schema for the session.

    const tenantUrl = url.toString();

    const client = new PrismaClient({
        datasources: {
            db: {
                url: tenantUrl,
            },
        },
    });

    tenantClients[schemaName] = client;
    return client;
};

export default prisma;
