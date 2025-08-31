import { NextRequest, NextResponse } from 'next/server'
import { generateTokenPair } from '@/lib/jwt'
import { handleApiError, ApiError, ApiErrorType } from '@/lib/api-errors'

const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'password'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (!password || password !== AUTH_PASSWORD) {
      throw new ApiError(
        ApiErrorType.AUTHENTICATION_ERROR,
        'Invalid credentials provided',
        401
      )
    }
    
    // Generate JWT token pair
    const userId = 'authenticated-user'
    const { accessToken, refreshToken } = generateTokenPair(userId)
    
    // Create response with tokens in httpOnly cookies
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful'
    })
    
    // Set httpOnly cookies for security
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    })
    
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })
    
    return response
    
  } catch (error) {
    return handleApiError(error)
  }
}