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
    const { readLater } = await request.json()

    // Validate ID format (cuid format)
    if (!/^[a-z0-9]{25}$/.test(id)) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'Invalid news item ID format',
        400,
        { expectedFormat: 'CUID (25 character alphanumeric)' }
      )
    }

    // Validate readLater value
    if (typeof readLater !== 'boolean') {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'Invalid readLater value',
        400,
        { validValues: [true, false], description: 'true = save for later, false = remove from later list' }
      )
    }

    // Check if news item exists first
    const newsItem = await db.newsItem.findUnique({
      where: { id }
    })

    if (!newsItem) {
      throw CommonErrors.NOT_FOUND
    }

    // Update the news item readLater status
    const updatedNews = await db.newsItem.update({
      where: { id },
      data: { readLater }
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