import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Log connection info in development (remove after debugging)
if (process.env.NODE_ENV === "development") {
  console.log("Prisma DATABASE_URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"))
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

