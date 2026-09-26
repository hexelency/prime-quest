import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaConnectionString?: string };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

function createPrismaClient(connectionString: string) {
  const adapter = new PrismaPg({ connectionString, max: 3 });
  return new PrismaClient({ adapter });
}

export const prisma = connectionString
  ? globalForPrisma.prismaConnectionString === connectionString
    ? globalForPrisma.prisma ?? createPrismaClient(connectionString)
    : createPrismaClient(connectionString)
  : null;

if (connectionString && prisma) {
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
