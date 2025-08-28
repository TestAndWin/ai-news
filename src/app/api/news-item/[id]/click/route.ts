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

    return NextResponse.json(updatedNews)
  } catch (error) {
    console.error('Error marking news as clicked:', error)
    return NextResponse.json(
      { error: 'Failed to mark news as clicked' },
      { status: 500 }
    )
  }
}

// Apply authentication and rate limiting
export const PATCH = withRateLimit(withApiAuth(handlePATCH))