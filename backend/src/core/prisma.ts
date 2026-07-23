import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

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
