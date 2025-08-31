import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromBearer, type TokenPayload } from './jwt'

// Fallback API key for development/backward compatibility
const API_KEY = process.env.API_KEY || 'dev-api-key-change-in-production'

export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || 
               request.nextUrl.searchParams.get('api_key')
  
  return apiKey === API_KEY
}

export function validateJwtToken(request: NextRequest): TokenPayload | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization')
  let token = extractTokenFromBearer(authHeader)
  
  // Fallback to cookie if no Bearer token
  if (!token) {
    token = request.cookies.get('access_token')?.value || null
  }
  
  if (!token) {
    return null
  }
  
  return verifyAccessToken(token)
}

export function createUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized. Valid JWT token required.' },
    { status: 401 }
  )
}

export function withAuth(handler: (request: NextRequest, tokenPayload: TokenPayload, ...args: unknown[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    // Try JWT authentication first
    const tokenPayload = validateJwtToken(request)
    if (tokenPayload) {
      return handler(request, tokenPayload, ...args)
    }
    
    // Fallback to API key for backward compatibility
    if (validateApiKey(request)) {
      // Create a mock token payload for API key authentication
      const mockPayload: TokenPayload = { userId: 'api-key-user' }
      return handler(request, mockPayload, ...args)
    }
    
    return createUnauthorizedResponse()
  }
}

// Legacy function for backward compatibility
export function withApiAuth(handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>) {
  return withAuth(async (request: NextRequest, tokenPayload: TokenPayload, ...args: unknown[]) => {
    return handler(request, ...args)
  })
}