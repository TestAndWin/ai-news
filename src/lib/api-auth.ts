import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromBearer, type TokenPayload } from './jwt'
import { CommonErrors, handleApiError } from './api-errors'

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
  return handleApiError(CommonErrors.UNAUTHORIZED)
}

export function withAuth(handler: (request: NextRequest, tokenPayload: TokenPayload, ...args: unknown[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    const tokenPayload = validateJwtToken(request)
    if (tokenPayload) {
      return handler(request, tokenPayload, ...args)
    }
    
    return createUnauthorizedResponse()
  }
}