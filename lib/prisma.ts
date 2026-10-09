import "server-only"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/src/generated/prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Created on first use rather than at import time, so `next build` works
// without a database connection string.
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env.local")
    }
    globalForPrisma.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  }
  return globalForPrisma.prisma
}
