import { NextRequest, NextResponse } from 'next/server'
import { generateTokenPair } from '@/lib/jwt'
import { handleApiError, ApiError, ApiErrorType } from '@/lib/api-errors'

const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'password'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    console.log('[LOGIN DEBUG] Password received:', password ? '***' : 'none')
    console.log('[LOGIN DEBUG] Expected password:', AUTH_PASSWORD ? '***' : 'none')

    if (!password || password !== AUTH_PASSWORD) {
      console.log('[LOGIN DEBUG] Password mismatch!')
      throw new ApiError(
        ApiErrorType.AUTHENTICATION_ERROR,
        'Invalid credentials provided',
        401
      )
    }

    // Generate JWT token pair
    const userId = 'authenticated-user'
    const { accessToken, refreshToken } = generateTokenPair(userId)

    console.log('[LOGIN DEBUG] Tokens generated successfully')
    console.log('[LOGIN DEBUG] Access token length:', accessToken.length)

    // Create response with tokens in httpOnly cookies
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful'
    })

    // Set httpOnly cookies for security
    const isProduction = process.env.NODE_ENV === 'production'
    console.log('[LOGIN DEBUG] Environment:', { isProduction, NODE_ENV: process.env.NODE_ENV })

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      maxAge: 60 * 60,
      path: '/'
    }

    console.log('[LOGIN DEBUG] Cookie options:', cookieOptions)

    response.cookies.set('access_token', accessToken, cookieOptions)
    response.cookies.set('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    console.log('[LOGIN DEBUG] Cookies set on response')
    console.log('[LOGIN DEBUG] Response cookies:', response.cookies.getAll())

    return response
    
  } catch (error) {
    return handleApiError(error)
  }
}