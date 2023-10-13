import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { migrate as pgMigrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "./schema";

const getDatabaseUrl = () => {
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
    throw new Error("DATABASE_URL environment variable not set");
};

// Create the database connection pool.
const pool = new Pool({
    connectionString: getDatabaseUrl(),
});

// Create the database connection.
const db = drizzle(pool, { schema });

/**
 * Get the database connection.
 * @returns The database connection.
 */
export function getConnection(): NodePgDatabase<typeof schema> {
    return db;
}

/**
 * Migrate the database.
 * @returns A promise that resolves when the migration is complete.
 */
export async function migrate() {
    return await pgMigrate(db, { migrationsFolder: "./drizzle" });
}
