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
        const response = await api.patch(`/api/news-item/${news.id}/click`)
        
        if (response.ok) {
          // Notify parent component of successful click
          onNewsClicked?.(news.id)
        } else {
          console.error('Failed to track click:', response.status, response.statusText)
        }
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
      const response = await api.patch(`/api/news-item/${news.id}/rate`, { rating: newRating })
      
      if (response.ok) {
        // Notify parent component of successful rating
        onNewsRated?.(news.id, newRating)
      } else {
        console.error('Failed to update rating:', response.status, response.statusText)
        // Revert UI state on error
        setCurrentRating(currentRating)
      }
    } catch (error) {
      console.error('Failed to update rating:', error)
      // Revert UI state on error
      setCurrentRating(currentRating)
    }
  }

  return (
    <Card className={`border-2 border-[#00ff88]/30 bg-card/40 backdrop-blur-sm hover:border-[#00ff88] hover:shadow-[0_0_30px_#00ff88,inset_0_0_20px_rgba(0,255,136,0.1)] transition-all duration-500 group relative overflow-hidden hologram news-card flex flex-col ${isClicked ? 'opacity-70' : ''}`}>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00f5ff]"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ff0080]"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#ff0080]"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00f5ff]"></div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff88]/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_ease-out] pointer-events-none"></div>
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-lg text-foreground group-hover:text-[#00ff88] transition-all duration-300 line-clamp-2 font-['var(--font-orbitron)']" 
              style={{textShadow: '0 0 10px rgba(0,255,136,0.5)'}}>
            {news.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isClicked && (
              <Check className="w-4 h-4 text-[#00ff88] neon-glow" />
            )}
            
            {/* Rating buttons - always shown */}
            <button
              onClick={() => handleRating(2)}
              className={`transition-all duration-200 hover:scale-110 ${
                currentRating === 2
                  ? 'text-[#00ff88] neon-glow'
                  : 'text-[#00f5ff] hover:text-[#00ff88]'
              }`}
              title="Thumbs Up"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleRating(1)}
              className={`transition-all duration-200 hover:scale-110 ${
                currentRating === 1
                  ? 'text-[#ff0080] neon-glow'
                  : 'text-[#00f5ff] hover:text-[#ff0080]'
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
              className="text-[#00f5ff] hover:text-[#00ff88] transition-all duration-200 hover:scale-110 neon-glow ml-1"
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
          <span className="text-[#00f5ff] font-medium font-['var(--font-share-tech-mono)'] bg-[#00f5ff]/10 px-2 py-1 rounded border border-[#00f5ff]/30">
            {news.source}
          </span>
          <div className="flex items-center gap-1 text-muted-foreground font-['var(--font-share-tech-mono)']">
            <Clock className="w-3 h-3 text-[#ff0080]" />
            <span>{formatDate(news.publishedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}