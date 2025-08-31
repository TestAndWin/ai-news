import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api-auth'

async function handlePATCH(
  request: NextRequest,
  tokenPayload: any,
  { params }: { params: Promise<{ id: string }> }
) {

  // Apply rate limiting
  const { checkRateLimit, createRateLimitResponse } = await import('@/lib/rate-limiter')
  const { allowed, remainingRequests, resetTime } = checkRateLimit(request)
  if (!allowed) {
    return createRateLimitResponse()
  }

  try {
    const { id } = await params

    // Validate ID format (cuid format)
    if (!/^[a-z0-9]{25}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid news item ID format' },
        { status: 400 }
      )
    }

    // Check if news item exists first
    const newsItem = await db.newsItem.findUnique({
      where: { id }
    })

    if (!newsItem) {
      return NextResponse.json(
        { error: 'News item not found' },
        { status: 404 }
      )
    }

    // Update the news item to mark it as clicked
    const updatedNews = await db.newsItem.update({
      where: { id },
      data: { clicked: true }
    })

    const response = NextResponse.json(updatedNews)
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '10')
    response.headers.set('X-RateLimit-Remaining', remainingRequests.toString())
    response.headers.set('X-RateLimit-Reset', resetTime.toString())

    return response
  } catch (error) {
    console.error('Error marking news as clicked:', error)
    return NextResponse.json(
      { error: 'Failed to mark news as clicked' },
      { status: 500 }
    )
  }
}

export const PATCH = withAuth(handlePATCH)