import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    })
    
    // Clear authentication cookies
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })
    
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })
    
    return response
    
  } catch {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}