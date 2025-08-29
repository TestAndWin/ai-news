import { PrismaClient } from '@prisma/client'

// Ensure DATABASE_URL is set with fallback for Vercel
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:/tmp/dev.db'
  console.log('⚠️ DATABASE_URL not found, using fallback: file:/tmp/dev.db')
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db