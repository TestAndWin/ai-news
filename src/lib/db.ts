import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import pg from 'pg'

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

// Create appropriate adapter based on environment
let adapter
if (isProduction && isVercel) {
  // PostgreSQL adapter for Vercel production
  console.log('🐘 Using PostgreSQL for Vercel production')
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  adapter = new PrismaPg(pool)
} else {
  // SQLite adapter for development
  console.log('🗄️ Using SQLite for development')
  adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL as string,
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
    adapter,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db