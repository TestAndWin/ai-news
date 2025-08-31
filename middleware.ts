import { NextRequest, NextResponse } from 'next/server'
import { validateJwtToken } from '@/lib/api-auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for login page and auth API routes
  if (pathname.startsWith('/login') || 
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  // Check for valid JWT token
  const tokenPayload = validateJwtToken(request)
  
  if (!tokenPayload) {
    // Redirect to login if no valid token
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}