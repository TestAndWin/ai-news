import { NextRequest, NextResponse } from 'next/server'
import { validateJwtToken } from '@/lib/api-auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('[MIDDLEWARE DEBUG] Request:', pathname)
  console.log('[MIDDLEWARE DEBUG] All cookies:', request.cookies.getAll())
  console.log('[MIDDLEWARE DEBUG] Access token cookie:', request.cookies.get('access_token'))

  // Skip middleware for login page and auth API routes
  if (pathname.startsWith('/login') ||
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico')) {
    console.log('[MIDDLEWARE DEBUG] Skipping middleware for:', pathname)
    return NextResponse.next()
  }

  // Check for valid JWT token
  const tokenPayload = validateJwtToken(request)

  console.log('[MIDDLEWARE DEBUG] Token validation result:', tokenPayload ? 'valid' : 'invalid')

  if (!tokenPayload) {
    console.log('[MIDDLEWARE DEBUG] No valid token, redirecting to /login')
    // Redirect to login if no valid token
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log('[MIDDLEWARE DEBUG] Token valid, allowing request')
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