import { NextRequest, NextResponse } from 'next/server'

// Simple API key authentication
const API_KEY = process.env.API_KEY || 'dev-api-key-change-in-production'

export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || 
                request.nextUrl.searchParams.get('api_key')
  
  return apiKey === API_KEY
}

export function createUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized. Valid API key required.' },
    { status: 401 }
  )
}

export function withApiAuth(handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    if (!validateApiKey(request)) {
      return createUnauthorizedResponse()
    }
    
    return handler(request, ...args)
  }
}