import { PrismaClient } from '@prisma/client';

const platformPrisma = new PrismaClient();

/**
 * Creates a new tenant schema for a PHC
 * @param phcId - The UUID of the PHC
 * @returns The schema name (e.g., "phc_abc123")
 */
export async function createTenantSchema(phcId: string): Promise<string> {
    const schemaName = `phc_${phcId.replace(/-/g, '_')}`;

    try {
        // Create the schema
        await platformPrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

        console.log(`✅ Created schema: ${schemaName}`);
        return schemaName;
    } catch (error) {
        console.error(`❌ Failed to create schema ${schemaName}:`, error);
        throw error;
    }
}

/**
 * Runs migrations for a tenant schema
 * Creates all tenant tables in the specified schema
 */
export async function runMigrationsForTenant(schemaName: string): Promise<void> {
    try {
        const tables = [
            // User table
            `CREATE TABLE IF NOT EXISTS "${schemaName}"."User" (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL
            )`,

            // Patient table
            `CREATE TABLE IF NOT EXISTS "${schemaName}"."Patient" (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT,
                "bloodGroup" TEXT,
                "emergencyContact" TEXT,
                weight DOUBLE PRECISION,
                bp TEXT,
                sugar TEXT,
                temp DOUBLE PRECISION,
                "preExistingDiseases" TEXT,
                allergies TEXT,
                "isPregnant" BOOLEAN NOT NULL DEFAULT false,
                "patientType" TEXT NOT NULL DEFAULT 'OPD',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL
            )`,

            // OPDVisit table
            `CREATE TABLE IF NOT EXISTS "${schemaName}"."OPDVisit" (
                id TEXT PRIMARY KEY,
                "patientId" TEXT NOT NULL,
                "tokenNo" INTEGER NOT NULL,
                status TEXT NOT NULL,
                weight DOUBLE PRECISION,
                bp TEXT,
                sugar TEXT,
                temp DOUBLE PRECISION,
                symptoms TEXT,
                diagnosis TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                FOREIGN KEY ("patientId") REFERENCES "${schemaName}"."Patient"(id)
            )`,

            // LabOrder table
            `CREATE TABLE IF NOT EXISTS "${schemaName}"."LabOrder" (
                id TEXT PRIMARY KEY,
                "opdVisitId" TEXT NOT NULL,
                "testName" TEXT NOT NULL,
                status TEXT NOT NULL,
                result TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                FOREIGN KEY ("opdVisitId") REFERENCES "${schemaName}"."OPDVisit"(id)
            )`,

            // Prescription table
            `CREATE TABLE IF NOT EXISTS "${schemaName}"."Prescription" (
                id TEXT PRIMARY KEY,
                "opdVisitId" TEXT NOT NULL,
                medicine TEXT NOT NULL,
                dosage TEXT NOT NULL,
                status TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                FOREIGN KEY ("opdVisitId") REFERENCES "${schemaName}"."OPDVisit"(id)
            )`,

            // Bed table
            `CREATE TABLE IF NOT EXISTS "${schemaName}"."Bed" (
                id TEXT PRIMARY KEY,
                number TEXT UNIQUE NOT NULL,
                "isOccupied" BOOLEAN NOT NULL DEFAULT false
            )`,

            // Admission table
            `CREATE TABLE IF NOT EXISTS "${schemaName}"."Admission" (
                id TEXT PRIMARY KEY,
                "patientId" TEXT NOT NULL,
                "bedId" TEXT NOT NULL,
                "admittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "dischargedAt" TIMESTAMP(3),
                status TEXT NOT NULL,
                FOREIGN KEY ("patientId") REFERENCES "${schemaName}"."Patient"(id),
                FOREIGN KEY ("bedId") REFERENCES "${schemaName}"."Bed"(id)
            )`,

            // AuditLog table
            `CREATE TABLE IF NOT EXISTS "${schemaName}"."AuditLog" (
                id TEXT PRIMARY KEY,
                action TEXT NOT NULL,
                "actorId" TEXT NOT NULL,
                details TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        // Execute each CREATE TABLE statement separately
        for (const tableSQL of tables) {
            await platformPrisma.$executeRawUnsafe(tableSQL);
        }

        console.log(`✅ Created tables in schema: ${schemaName}`);
    } catch (error) {
        console.error(`❌ Failed to create tables in ${schemaName}:`, error);
        throw error;
    }
}

/**
 * Deletes a tenant schema and all its data
 * WARNING: This is irreversible!
 */
export async function deleteTenantSchema(schemaName: string): Promise<void> {
    try {
        await platformPrisma.$executeRawUnsafe(`DROP SCHEMA IF NOT EXISTS "${schemaName}" CASCADE`);
        console.log(`✅ Deleted schema: ${schemaName}`);
    } catch (error) {
        console.error(`❌ Failed to delete schema ${schemaName}:`, error);
        throw error;
    }
}

/**
 * Lists all tenant schemas
 */
export async function listTenantSchemas(): Promise<string[]> {
    const result = await platformPrisma.$queryRaw<Array<{ schema_name: string }>>`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name LIKE 'phc_%'
    `;
    return result.map(r => r.schema_name);
}
