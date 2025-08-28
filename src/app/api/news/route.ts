import { NextResponse } from 'next/server'
import { getAllNews } from '@/lib/news-fetcher'

export async function GET() {
  try {
    const news = await getAllNews()
    return NextResponse.json(news)
  } catch (error) {
    console.error('Error getting news:', error)
    return NextResponse.json(
      { error: 'Failed to get news' },
      { status: 500 }
    )
  }
}