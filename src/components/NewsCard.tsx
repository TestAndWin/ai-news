import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ExternalLink, Clock, Check, ThumbsUp, ThumbsDown } from "lucide-react"
import { useState } from "react"
import { api } from "@/lib/api-client"

interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  publishedAt: Date
  source: string
  clicked: boolean
  rating?: number | null
  readLater: boolean
}

interface NewsCardProps {
  news: NewsItem
  onNewsClicked?: (id: string) => void
  onNewsRated?: (id: string, rating: number | null) => void
}

export function NewsCard({ news, onNewsClicked, onNewsRated }: NewsCardProps) {
  const [isClicked, setIsClicked] = useState(news.clicked)
  const [currentRating, setCurrentRating] = useState(news.rating)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const handleLinkClick = async () => {
    if (!isClicked) {
      // Optimistically update UI
      setIsClicked(true)
      
      // Track click in database
      try {
        // API client now returns parsed JSON data on success
        await api.patch(`/api/news-item/${news.id}/click`)
        
        // If we reach here, the request was successful
        onNewsClicked?.(news.id)
      } catch (error) {
        console.error('Failed to track click:', error)
        // Don't revert UI state as the user already navigated away
      }
    }
  }

  const handleRating = async (rating: number | null) => {
    // Toggle rating: if same rating clicked, remove it
    const newRating = currentRating === rating ? null : rating
    
    // Optimistically update UI
    setCurrentRating(newRating)
    
    // Update rating in database
    try {
      // API client now returns parsed JSON data on success
      await api.patch(`/api/news-item/${news.id}/rate`, { rating: newRating })
      
      // If we reach here, the request was successful
      onNewsRated?.(news.id, newRating)
    } catch (error) {
      console.error('Failed to update rating:', error)
      // Revert UI state on error
      setCurrentRating(currentRating)
    }
  }

  return (
    <Card className={`border-2 border-[var(--pulp-orange)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-orange)] hover:shadow-[0_0_30px_var(--pulp-orange),inset_0_0_20px_rgba(255,107,53,0.1)] transition-all duration-500 group relative overflow-hidden hologram news-card flex flex-col ${isClicked ? 'opacity-70' : ''}`}>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--pulp-blue)]"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--pulp-red)]"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--pulp-red)]"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--pulp-blue)]"></div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--pulp-orange)]/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_ease-out] pointer-events-none"></div>
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-lg text-foreground group-hover:text-[var(--pulp-orange)] transition-all duration-300 line-clamp-2 font-['var(--font-orbitron)']" 
              style={{textShadow: '0 0 10px rgba(255,107,53,0.5)'}}>
            {news.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isClicked && (
              <Check className="w-4 h-4 text-[var(--pulp-orange)] heroic-glow" />
            )}
            
            {/* Rating buttons - always shown */}
            <button
              onClick={() => handleRating(2)}
              className={`transition-all duration-200 hover:scale-110 ${
                currentRating === 2
                  ? 'text-[var(--pulp-orange)] heroic-glow'
                  : 'text-[var(--pulp-blue)] hover:text-[var(--pulp-orange)]'
              }`}
              title="Thumbs Up"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleRating(1)}
              className={`transition-all duration-200 hover:scale-110 ${
                currentRating === 1
                  ? 'text-[var(--pulp-red)] heroic-glow'
                  : 'text-[var(--pulp-blue)] hover:text-[var(--pulp-red)]'
              }`}
              title="Thumbs Down"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="text-[var(--pulp-blue)] hover:text-[var(--pulp-orange)] transition-all duration-200 hover:scale-110 heroic-glow ml-1"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 flex-1 flex flex-col">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 font-['var(--font-share-tech-mono)'] flex-1">
          {news.summary}
        </p>
        <div className="flex items-center justify-between text-xs mt-auto">
          <span className="text-[var(--pulp-blue)] font-medium font-['var(--font-share-tech-mono)'] bg-[var(--pulp-blue)]/10 px-2 py-1 rounded border border-[var(--pulp-blue)]/30">
            {news.source}
          </span>
          <div className="flex items-center gap-4 text-muted-foreground font-['var(--font-share-tech-mono)'] pl-4">
            <Clock className="w-3 h-3 text-[var(--pulp-red)]" />
            <span>{formatDate(news.publishedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}