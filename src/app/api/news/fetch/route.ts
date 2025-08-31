import { NextRequest, NextResponse } from 'next/server'
import { fetchAllNews, fetchSingleSource } from '@/lib/news-fetcher'
import { withAuth } from '@/lib/api-auth'
import { withRateLimit } from '@/lib/rate-limiter'
import { handleApiError, ApiError, ApiErrorType } from '@/lib/api-errors'

async function handlePOST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const source = url.searchParams.get('source')
    
    // Validate source parameter if provided
    if (source) {
      // Basic validation - only allow alphanumeric and common separators
      if (!/^[a-zA-Z0-9\s\-_.&]+$/.test(source)) {
        throw new ApiError(
          ApiErrorType.VALIDATION_ERROR,
          'Invalid source parameter format',
          400,
          { allowedPattern: 'alphanumeric, spaces, hyphens, underscores, dots, and ampersands' }
        )
      }
      
      await fetchSingleSource(source)
      return NextResponse.json({ success: true, message: `News fetched successfully for ${source}` })
    } else {
      await fetchAllNews()
      return NextResponse.json({ success: true, message: 'News fetched successfully' })
    }
  } catch (error) {
    return handleApiError(error)
  }
}

// Apply authentication and rate limiting
export const POST = withRateLimit(withAuth(handlePOST))