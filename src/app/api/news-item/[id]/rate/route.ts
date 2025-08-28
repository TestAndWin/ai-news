import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withApiAuth } from '@/lib/api-auth'
import { withRateLimit } from '@/lib/rate-limiter'

async function handlePATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { rating } = await request.json()

    // Validate ID format (cuid format)
    if (!/^[a-z0-9]{25}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid news item ID format' },
        { status: 400 }
      )
    }

    // Validate rating value
    if (rating !== null && rating !== 1 && rating !== 2) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be 1 (thumbs down), 2 (thumbs up), or null' },
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

    // Update the news item rating
    const updatedNews = await db.newsItem.update({
      where: { id },
      data: { rating }
    })

    return NextResponse.json(updatedNews)
  } catch (error) {
    console.error('Error updating news rating:', error)
    return NextResponse.json(
      { error: 'Failed to update news rating' },
      { status: 500 }
    )
  }
}

// Apply authentication and rate limiting
export const PATCH = withRateLimit(withApiAuth(handlePATCH))