import { NextRequest, NextResponse } from 'next/server'
import { getLastRefreshTimestamp, setLastRefreshTimestamp, formatTimestamp, getRelativeTime } from '@/lib/metadata'

export async function GET() {
  try {
    const lastRefresh = await getLastRefreshTimestamp()
    
    return NextResponse.json({
      timestamp: lastRefresh?.toISOString() || null,
      formatted: formatTimestamp(lastRefresh),
      relative: getRelativeTime(lastRefresh)
    })
  } catch (error) {
    console.error('Error getting last refresh timestamp:', error)
    return NextResponse.json(
      { error: 'Failed to get last refresh timestamp' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const timestamp = body.timestamp ? new Date(body.timestamp) : new Date()
    
    const success = await setLastRefreshTimestamp(timestamp)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update last refresh timestamp' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      timestamp: timestamp.toISOString(),
      formatted: formatTimestamp(timestamp),
      relative: getRelativeTime(timestamp)
    })
  } catch (error) {
    console.error('Error updating last refresh timestamp:', error)
    return NextResponse.json(
      { error: 'Failed to update last refresh timestamp' },
      { status: 500 }
    )
  }
}