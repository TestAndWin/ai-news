import { NextResponse } from 'next/server'
import { Category } from '@prisma/client'
import { getNewsByCategory } from '@/lib/news-fetcher'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const resolvedParams = await params
    let category: Category

    switch (resolvedParams.category.toLowerCase()) {
      case 'tech':
      case 'tech-product':
        category = Category.TECH_PRODUCT
        break
      case 'research':
      case 'research-science':
        category = Category.RESEARCH_SCIENCE
        break
      case 'business':
      case 'business-society':
        category = Category.BUSINESS_SOCIETY
        break
      default:
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
    }

    const news = await getNewsByCategory(category, 10)
    return NextResponse.json(news)
  } catch (error) {
    console.error('Error getting news by category:', error)
    return NextResponse.json(
      { error: 'Failed to get news' },
      { status: 500 }
    )
  }
}