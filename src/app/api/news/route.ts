import { NextResponse } from 'next/server'
import { getAllNews, getAllNewsUnfiltered, getUnreadNews, getReadLaterNews, getInterestingNews } from '@/lib/news-fetcher'
import { withAuth } from '@/lib/api-auth'

async function handleGET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const viewMode = searchParams.get('viewMode') || 'curated'

    let news
    switch (viewMode) {
      case 'all':
        news = await getAllNewsUnfiltered()
        break
      case 'unread':
        news = await getUnreadNews()
        break
      case 'readLater':
        news = await getReadLaterNews()
        break
      case 'interesting':
        news = await getInterestingNews()
        break
      case 'curated':
      default:
        news = await getAllNews()
        break
    }

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error getting news:', error)
    return NextResponse.json(
      { error: 'Failed to get news' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGET)