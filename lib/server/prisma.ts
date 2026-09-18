import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client/index";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaConnectionString?: string };

function createPrismaClient() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) return null;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
export const prisma = globalForPrisma.prismaConnectionString === connectionString
  ? globalForPrisma.prisma ?? createPrismaClient()
  : createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaConnectionString = connectionString;
}

export function isPrismaConfigured() {
  return prisma !== null;
}

export function requirePrisma() {
  if (!prisma) throw new Error("Database is not configured.");
  return prisma;
}
