import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const envPath = existsSync(resolve(process.cwd(), '.env'))
  ? resolve(process.cwd(), '.env')
  : resolve(process.cwd(), 'backend/.env');

config({ path: envPath });

const databaseURL = process.env.DATABASE_URL;

if ( !databaseURL) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

const url = new URL(databaseURL);

const adapter = new PrismaMariaDb({
    host: url.hostname, 
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.replace(/^\//, ''), 
    allowPublicKeyRetrieval: true,
});

export const prisma = new PrismaClient({
    adapter, 
}); 
