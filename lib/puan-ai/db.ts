import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  puanAIPrisma?: PrismaClient;
};

export function createPrismaClient(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for PuanAI database access.");
  }

  const adapter = new PrismaPg({
    connectionString,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 5_000,
    // Each Vercel function instance owns its pool. Keeping one connection per
    // instance prevents a burst of cold starts from exhausting the database.
    max: process.env.VERCEL ? 1 : 5,
  });

  return new PrismaClient({ adapter });
}

export function getPrisma() {
  if (globalForPrisma.puanAIPrisma) return globalForPrisma.puanAIPrisma;
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.puanAIPrisma = client;
  return client;
}

