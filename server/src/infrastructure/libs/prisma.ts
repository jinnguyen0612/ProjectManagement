import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "../../core/config/env";

const connectionString = env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is not defined in environment variables");
}

const cleanConnectionString = connectionString?.replace(/[?&]sslmode=[^&]*/g, (match, offset, str) => {
    return match.startsWith('?') ? '?' : '';
}).replace(/\?$/, ''); // clean trailing ?

const needsSsl = connectionString?.includes('sslmode=');

const pool = new pg.Pool({
    connectionString: cleanConnectionString,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
    adapter,
    log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
