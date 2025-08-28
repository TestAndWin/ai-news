import { db } from './db'

const LAST_REFRESH_KEY = 'last_news_refresh'

export async function getLastRefreshTimestamp(): Promise<Date | null> {
  try {
    const metadata = await db.appMetadata.findUnique({
      where: { key: LAST_REFRESH_KEY }
    })
    
    return metadata ? new Date(metadata.value) : null
  } catch (error) {
    console.error('Error getting last refresh timestamp:', error)
    return null
  }
}

export async function setLastRefreshTimestamp(timestamp: Date = new Date()): Promise<boolean> {
  try {
    await db.appMetadata.upsert({
      where: { key: LAST_REFRESH_KEY },
      update: { 
        value: timestamp.toISOString(),
        updatedAt: new Date()
      },
      create: {
        key: LAST_REFRESH_KEY,
        value: timestamp.toISOString(),
        updatedAt: new Date()
      }
    })
    
    return true
  } catch (error) {
    console.error('Error setting last refresh timestamp:', error)
    return false
  }
}

export function formatTimestamp(date: Date | null): string {
  if (!date) return 'Never'
  
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date)
}

export function getRelativeTime(date: Date | null): string {
  if (!date) return 'Never'
  
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hours ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  
  return formatTimestamp(date)
}