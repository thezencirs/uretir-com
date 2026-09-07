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
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
    max: process.env.NODE_ENV === "production" ? 10 : 5,
  });

  return new PrismaClient({ adapter });
}

export function getPrisma() {
  if (globalForPrisma.puanAIPrisma) return globalForPrisma.puanAIPrisma;
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.puanAIPrisma = client;
  return client;
}

