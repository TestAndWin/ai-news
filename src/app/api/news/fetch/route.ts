import { NextRequest, NextResponse } from 'next/server'
import { fetchAllNews, fetchSingleSource } from '@/lib/news-fetcher'
import { withAuth } from '@/lib/api-auth'
import { withRateLimit } from '@/lib/rate-limiter'
import { type TokenPayload } from '@/lib/jwt'

async function handlePOST(request: NextRequest, _tokenPayload: TokenPayload) {
  try {
    const url = new URL(request.url)
    const source = url.searchParams.get('source')
    
    // Validate source parameter if provided
    if (source) {
      // Basic validation - only allow alphanumeric and common separators
      if (!/^[a-zA-Z0-9\s\-_.&]+$/.test(source)) {
        return NextResponse.json(
          { success: false, error: 'Invalid source parameter' },
          { status: 400 }
        )
      }
      
      await fetchSingleSource(source)
      return NextResponse.json({ success: true, message: `News fetched successfully for ${source}` })
    } else {
      await fetchAllNews()
      return NextResponse.json({ success: true, message: 'News fetched successfully' })
    }
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

// Apply authentication and rate limiting
export const POST = withRateLimit(withAuth(handlePOST))