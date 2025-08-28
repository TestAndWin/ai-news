import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  return 'unknown'
}

export function checkRateLimit(request: NextRequest): { allowed: boolean; remainingRequests: number; resetTime: number } {
  const clientIP = getClientIP(request)
  const now = Date.now()
  
  let entry = rateLimitMap.get(clientIP)
  
  // If no entry or window has expired, create new entry
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    }
    rateLimitMap.set(clientIP, entry)
    
    return {
      allowed: true,
      remainingRequests: RATE_LIMIT_MAX - 1,
      resetTime: entry.resetTime
    }
  }
  
  // Increment counter
  entry.count++
  
  const allowed = entry.count <= RATE_LIMIT_MAX
  
  return {
    allowed,
    remainingRequests: Math.max(0, RATE_LIMIT_MAX - entry.count),
    resetTime: entry.resetTime
  }
}

export function createRateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Rate limit exceeded. Too many requests.' },
    { status: 429 }
  )
}

export function withRateLimit<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const { allowed, remainingRequests, resetTime } = checkRateLimit(request)
    
    if (!allowed) {
      return createRateLimitResponse()
    }
    
    const response = await handler(request, ...args)
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString())
    response.headers.set('X-RateLimit-Remaining', remainingRequests.toString())
    response.headers.set('X-RateLimit-Reset', resetTime.toString())
    
    return response
  }
}