import { PrismaClient } from '@prisma/client'

// Database configuration - schema selection happens at build time via npm scripts
const isProduction = process.env.NODE_ENV === 'production'
const isVercel = process.env.VERCEL === '1'

// Set DATABASE_URL fallback if not provided
if (!process.env.DATABASE_URL) {
  if (isProduction && isVercel) {
    console.error('❌ DATABASE_URL not found! Make sure Vercel Postgres is configured.')
  } else {
    process.env.DATABASE_URL = 'file:./dev.db'
    console.log('📁 Using local SQLite database: ./dev.db')
  }
}

// Log database configuration
if (isProduction && isVercel) {
  console.log('🐘 Using PostgreSQL for Vercel production')
} else {
  console.log('🗄️ Using SQLite for development')
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