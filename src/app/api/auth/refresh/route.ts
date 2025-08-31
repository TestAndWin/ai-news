import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      )
    }
    
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      )
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(payload.userId)
    
    // Create response with new access token
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully'
    })
    
    // Update access token cookie
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    })
    
    return response
    
  } catch {
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    )
  }
}