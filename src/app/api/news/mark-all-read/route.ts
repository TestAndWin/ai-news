import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api-auth'

async function handlePOST() {
  try {
    // Mark all articles as clicked (read)
    const result = await db.newsItem.updateMany({
      where: {
        clicked: false
      },
      data: {
        clicked: true
      }
    })

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      message: `Marked ${result.count} articles as read`
    })
  } catch (error) {
    console.error('Error marking all articles as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark articles as read' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handlePOST)