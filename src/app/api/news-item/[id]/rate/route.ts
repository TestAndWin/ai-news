import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api-auth'
import { handleApiError, ApiError, ApiErrorType, CommonErrors } from '@/lib/api-errors'

async function handlePATCH(
  request: NextRequest,
  ...args: unknown[]
) {
  const { params } = args[1] as { params: Promise<{ id: string }> }

  // Apply rate limiting
  const { checkRateLimit, createRateLimitResponse } = await import('@/lib/rate-limiter')
  const { allowed, remainingRequests, resetTime } = checkRateLimit(request)
  if (!allowed) {
    return createRateLimitResponse()
  }

  try {
    const { id } = await params
    const { rating } = await request.json()

    // Validate ID format (cuid format)
    if (!/^[a-z0-9]{25}$/.test(id)) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'Invalid news item ID format',
        400,
        { expectedFormat: 'CUID (25 character alphanumeric)' }
      )
    }

    // Validate rating value
    if (rating !== null && rating !== 1 && rating !== 2) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'Invalid rating value',
        400,
        { validValues: [1, 2, null], description: '1 = thumbs down, 2 = thumbs up, null = remove rating' }
      )
    }

    // Check if news item exists first
    const newsItem = await db.newsItem.findUnique({
      where: { id }
    })

    if (!newsItem) {
      throw CommonErrors.NOT_FOUND
    }

    // Update the news item rating
    const updatedNews = await db.newsItem.update({
      where: { id },
      data: { rating }
    })

    const response = NextResponse.json(updatedNews)
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '10')
    response.headers.set('X-RateLimit-Remaining', remainingRequests.toString())
    response.headers.set('X-RateLimit-Reset', resetTime.toString())

    return response
  } catch (error) {
    return handleApiError(error)
  }
}

export const PATCH = withAuth(handlePATCH)