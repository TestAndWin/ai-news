import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production'

export interface TokenPayload {
  userId: string
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  userId: string
  tokenVersion: number
  iat?: number
  exp?: number
}

export function generateAccessToken(userId: string): string {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

export function generateRefreshToken(userId: string, tokenVersion: number = 1): string {
  return jwt.sign(
    { userId, tokenVersion },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload
  } catch {
    return null
  }
}

export function generateTokenPair(userId: string, tokenVersion: number = 1) {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId, tokenVersion)
  }
}

export function extractTokenFromBearer(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}