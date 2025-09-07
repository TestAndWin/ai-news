'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ExternalLink, Clock, ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, ArrowLeft, ArrowRight, Eye } from "lucide-react"
import { useState, useEffect, useRef } from "react"
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

interface SingleNewsViewProps {
  news: NewsItem
  onNewsClicked?: (id: string) => void
  onNewsRated?: (id: string, rating: number | null) => void
  onReadLaterToggled?: (id: string, readLater: boolean) => void
  onNext?: () => void
  onPrevious?: () => void
  currentIndex: number
  totalCount: number
  category: string
}

export function SingleNewsView({ 
  news, 
  onNewsClicked, 
  onNewsRated, 
  onReadLaterToggled,
  onNext, 
  onPrevious, 
  currentIndex, 
  totalCount, 
  category 
}: SingleNewsViewProps) {
  const [isClicked, setIsClicked] = useState(news.clicked)
  const [currentRating, setCurrentRating] = useState(news.rating)
  const [isReadLater, setIsReadLater] = useState(news.readLater)
  const navigationInProgress = useRef(false)

  // Sync local state with news prop changes (when navigating to different news)
  useEffect(() => {
    setIsClicked(news.clicked)
    setCurrentRating(news.rating)
    setIsReadLater(news.readLater)
    // Reset navigation flag when news changes
    navigationInProgress.current = false
  }, [news.id, news.clicked, news.rating, news.readLater])

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
      setIsClicked(true)
      
      try {
        await api.patch(`/api/news-item/${news.id}/click`)
        onNewsClicked?.(news.id)
        
        // Auto-advance to next news after marking as read
        if (!navigationInProgress.current) {
          navigationInProgress.current = true
          setTimeout(() => {
            if (navigationInProgress.current) {
              onNext?.()
            }
          }, 1000)
        }
      } catch (error) {
        console.error('Failed to track click:', error)
      }
    }
  }

  const handleRating = async (rating: number | null) => {
    const newRating = currentRating === rating ? null : rating
    setCurrentRating(newRating)
    
    try {
      await api.patch(`/api/news-item/${news.id}/rate`, { rating: newRating })
      onNewsRated?.(news.id, newRating)
      
      // If thumbs down, auto-advance to next news
      if (newRating === 1 && !navigationInProgress.current) {
        navigationInProgress.current = true
        // Use setTimeout to avoid double-triggering with other navigation
        setTimeout(() => {
          if (navigationInProgress.current) {
            onNext?.()
          }
        }, 100) // Reduced delay to avoid conflicts
      }
    } catch (error) {
      console.error('Failed to update rating:', error)
      setCurrentRating(currentRating)
    }
  }

  const handleReadLaterToggle = async () => {
    const newReadLater = !isReadLater
    setIsReadLater(newReadLater)
    
    try {
      await api.patch(`/api/news-item/${news.id}/read-later`, { readLater: newReadLater })
      onReadLaterToggled?.(news.id, newReadLater)
      
      // If marking as read later, auto-advance to next news
      if (newReadLater && !navigationInProgress.current) {
        navigationInProgress.current = true
        setTimeout(() => {
          if (navigationInProgress.current) {
            onNext?.()
          }
        }, 100)
      }
    } catch (error) {
      console.error('Failed to update read later status:', error)
      setIsReadLater(isReadLater)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[var(--pulp-blue)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-blue)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-['var(--font-share-tech-mono)']">PREVIOUS</span>
          </button>
          
          <div className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)']">
            <span className="text-[var(--pulp-orange)] font-bold">{currentIndex + 1}</span> / {totalCount}
          </div>
          
          <button
            onClick={onNext}
            disabled={currentIndex >= totalCount - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[var(--pulp-blue)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-blue)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <span className="font-['var(--font-share-tech-mono)']">NEXT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-[var(--pulp-orange)] font-['var(--font-orbitron)'] font-bold">
          {category}
        </div>
      </div>

      {/* News Card */}
      <Card className={`border-2 border-[var(--pulp-orange)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-orange)] hover:shadow-[0_0_30px_var(--pulp-orange),inset_0_0_20px_rgba(255,107,53,0.1)] transition-all duration-500 group relative overflow-hidden hologram news-card ${isClicked ? 'opacity-70' : ''}`}>
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[var(--pulp-blue)]"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[var(--pulp-red)]"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[var(--pulp-red)]"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[var(--pulp-blue)]"></div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--pulp-orange)]/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_ease-out] pointer-events-none"></div>
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-bold text-2xl md:text-3xl text-foreground group-hover:text-[var(--pulp-orange)] transition-all duration-300 font-['var(--font-orbitron)']" 
                style={{textShadow: '0 0 15px rgba(255,107,53,0.5)'}}>
              {news.title}
            </h1>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              {isClicked && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--pulp-orange)]/20 border border-[var(--pulp-orange)]/30">
                  <Eye className="w-4 h-4 text-[var(--pulp-orange)]" />
                  <span className="text-[var(--pulp-orange)] font-['var(--font-share-tech-mono)'] text-sm font-medium">READ</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-6">
          <p className="text-muted-foreground text-lg leading-relaxed font-['var(--font-share-tech-mono)']">
            {news.summary}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[var(--pulp-blue)] font-medium font-['var(--font-share-tech-mono)'] bg-[var(--pulp-blue)]/10 px-3 py-2 rounded border border-[var(--pulp-blue)]/30">
                {news.source}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground font-['var(--font-share-tech-mono)']">
                <Clock className="w-4 h-4 text-[var(--pulp-red)]" />
                <span>{formatDate(news.publishedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
        <button
          onClick={handleReadLaterToggle}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-300 font-['var(--font-share-tech-mono)'] font-medium ${
            isReadLater
              ? 'border-[var(--pulp-orange)] bg-[var(--pulp-orange)]/20 text-[var(--pulp-orange)] shadow-[0_0_20px_var(--pulp-orange)]'
              : 'border-[var(--pulp-blue)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-blue)] text-[var(--pulp-blue)] hover:text-[var(--pulp-orange)]'
          }`}
        >
          {isReadLater ? (
            <BookmarkCheck className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
          <span>{isReadLater ? 'SAVED' : 'READ LATER'}</span>
        </button>

        <button
          onClick={() => handleRating(1)}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-300 font-['var(--font-share-tech-mono)'] font-medium hover:scale-105 ${
            currentRating === 1
              ? 'border-[var(--pulp-red)] bg-[var(--pulp-red)]/20 text-[var(--pulp-red)] shadow-[0_0_20px_var(--pulp-red)]'
              : 'border-[var(--pulp-red)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-red)] text-[var(--pulp-red)]'
          }`}
        >
          <ThumbsDown className="w-5 h-5" />
          <span>NOT INTERESTED</span>
        </button>

        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-8 py-3 rounded-lg border-2 border-[var(--pulp-orange)]/30 bg-[var(--pulp-orange)]/10 backdrop-blur-sm hover:border-[var(--pulp-orange)] hover:bg-[var(--pulp-orange)]/20 hover:shadow-[0_0_30px_var(--pulp-orange)] text-[var(--pulp-orange)] font-['var(--font-share-tech-mono)'] font-medium transition-all duration-300 hover:scale-105"
        >
          <ExternalLink className="w-5 h-5" />
          <span>READ ARTICLE</span>
        </a>

        <button
          onClick={() => handleRating(2)}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-300 font-['var(--font-share-tech-mono)'] font-medium hover:scale-105 ${
            currentRating === 2
              ? 'border-[var(--pulp-green)] bg-[var(--pulp-green)]/20 text-[var(--pulp-green)] shadow-[0_0_20px_var(--pulp-green)]'
              : 'border-[var(--pulp-green)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-green)] text-[var(--pulp-green)]'
          }`}
        >
          <ThumbsUp className="w-5 h-5" />
          <span>INTERESTING</span>
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-center mt-8 text-muted-foreground font-['var(--font-share-tech-mono)'] text-sm">
        <p>Shortcuts: ← Previous | → Next | Space: Read | ↑ Interesting | ↓ Not interested | B: Read later</p>
      </div>
    </div>
  )
}