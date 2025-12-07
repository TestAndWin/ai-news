import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromBearer, type TokenPayload } from './jwt'
import { CommonErrors, handleApiError } from './api-errors'

export function validateJwtToken(request: NextRequest): TokenPayload | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization')
  let token = extractTokenFromBearer(authHeader)

  console.log('[VALIDATE DEBUG] Auth header:', authHeader ? 'present' : 'none')
  console.log('[VALIDATE DEBUG] Bearer token:', token ? 'extracted' : 'none')

  // Fallback to cookie if no Bearer token
  if (!token) {
    const cookieValue = request.cookies.get('access_token')?.value
    token = cookieValue || null
    console.log('[VALIDATE DEBUG] Cookie token:', token ? `present (${token.substring(0, 20)}...)` : 'none')
  }

  if (!token) {
    console.log('[VALIDATE DEBUG] No token found')
    return null
  }

  const payload = verifyAccessToken(token)
  console.log('[VALIDATE DEBUG] Token verification:', payload ? 'success' : 'failed')

  return payload
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