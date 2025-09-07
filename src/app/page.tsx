'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/Header'
import { SingleNewsView } from '@/components/SingleNewsView'
import { api } from '@/lib/api-client'
import { Building2, Eye, EyeOff, ThumbsDown, ThumbsUp, Bookmark, RotateCcw } from 'lucide-react'

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

interface NewsData {
  techNews: NewsItem[]
  researchNews: NewsItem[]
  businessNews: NewsItem[]
}

type ViewMode = 'unread' | 'readLater' | 'all'

export default function Home() {
  const [news, setNews] = useState<NewsData>({
    techNews: [],
    researchNews: [],
    businessNews: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('unread')
  const [showReadNews, setShowReadNews] = useState(false)
  const [showUninteresting, setShowUninteresting] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<{
    formatted: string
    relative: string
  } | null>(null)

  // Get all news items as flat array based on view mode
  const getAllNewsItems = useCallback(() => {
    const allNews = [...news.techNews, ...news.researchNews, ...news.businessNews]
    
    switch (viewMode) {
      case 'unread':
        return allNews.filter(item => !item.clicked && (!item.rating || item.rating === 2))
      case 'readLater':
        return allNews.filter(item => item.readLater)
      case 'all':
      default:
        return showReadNews && showUninteresting ? allNews :
               showReadNews ? allNews.filter(item => !item.rating || item.rating === 2) :
               showUninteresting ? allNews.filter(item => !item.clicked) :
               allNews.filter(item => !item.clicked && (!item.rating || item.rating === 2))
    }
  }, [news, viewMode, showReadNews, showUninteresting])

  const currentNews = getAllNewsItems()[currentNewsIndex]
  
  const getCategoryForNews = useCallback((newsItem: NewsItem) => {
    if (news.techNews.find(item => item.id === newsItem?.id)) return 'TECH & PRODUCT'
    if (news.researchNews.find(item => item.id === newsItem?.id)) return 'RESEARCH & SCIENCE'
    if (news.businessNews.find(item => item.id === newsItem?.id)) return 'BUSINESS & SOCIETY'
    return 'UNKNOWN'
  }, [news])

  const handleNewsClicked = useCallback((clickedId: string) => {
    setNews(prevNews => ({
      techNews: prevNews.techNews.map(item => 
        item.id === clickedId ? { ...item, clicked: true } : item
      ),
      researchNews: prevNews.researchNews.map(item => 
        item.id === clickedId ? { ...item, clicked: true } : item
      ),
      businessNews: prevNews.businessNews.map(item => 
        item.id === clickedId ? { ...item, clicked: true } : item
      ),
    }))
  }, [])

  const handleNewsRated = useCallback((ratedId: string, rating: number | null) => {
    setNews(prevNews => ({
      techNews: prevNews.techNews.map(item => 
        item.id === ratedId ? { ...item, rating } : item
      ),
      researchNews: prevNews.researchNews.map(item => 
        item.id === ratedId ? { ...item, rating } : item
      ),
      businessNews: prevNews.businessNews.map(item => 
        item.id === ratedId ? { ...item, rating } : item
      ),
    }))
  }, [])

  const handleReadLaterToggled = useCallback((toggledId: string, readLater: boolean) => {
    setNews(prevNews => ({
      techNews: prevNews.techNews.map(item => 
        item.id === toggledId ? { ...item, readLater } : item
      ),
      researchNews: prevNews.researchNews.map(item => 
        item.id === toggledId ? { ...item, readLater } : item
      ),
      businessNews: prevNews.businessNews.map(item => 
        item.id === toggledId ? { ...item, readLater } : item
      ),
    }))
  }, [])

  const handleNext = useCallback(() => {
    const allNews = getAllNewsItems()
    if (currentNewsIndex < allNews.length - 1) {
      setCurrentNewsIndex(currentNewsIndex + 1)
    }
  }, [currentNewsIndex, getAllNewsItems])

  const handlePrevious = useCallback(() => {
    if (currentNewsIndex > 0) {
      setCurrentNewsIndex(currentNewsIndex - 1)
    }
  }, [currentNewsIndex])

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode)
    setCurrentNewsIndex(0)
  }, [])

  // Keyboard shortcuts
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        handlePrevious()
        break
      case 'ArrowRight':
        e.preventDefault()
        handleNext()
        break
      case ' ':
        e.preventDefault()
        if (currentNews) {
          window.open(currentNews.url, '_blank')
          handleNewsClicked(currentNews.id)
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (currentNews) {
          handleNewsRated(currentNews.id, 2)
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (currentNews) {
          handleNewsRated(currentNews.id, 1)
        }
        break
      case 'b':
      case 'B':
        e.preventDefault()
        if (currentNews) {
          handleReadLaterToggled(currentNews.id, !currentNews.readLater)
        }
        break
    }
  }, [currentNews, handleNewsClicked, handleNewsRated, handleReadLaterToggled, handleNext, handlePrevious])

  const fetchLastRefresh = useCallback(async () => {
    try {
      const data = await api.get('/api/metadata/last-refresh')
      if (data.formatted && data.relative) {
        setLastRefresh({
          formatted: data.formatted,
          relative: data.relative
        })
      }
    } catch (error) {
      console.error('Error fetching last refresh timestamp:', error)
    }
  }, [])

  const fetchNews = useCallback(async () => {
    try {
      const data = await api.get('/api/news')
      setNews(data)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await api.post('/api/news/fetch')
      
      await api.post('/api/metadata/last-refresh', { 
        timestamp: new Date().toISOString() 
      })
      
      await fetchNews()
      await fetchLastRefresh()
    } catch (error) {
      console.error('Error refreshing news:', error)
      setIsRefreshing(false)
    }
  }, [fetchNews, fetchLastRefresh])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    fetchNews()
    fetchLastRefresh()
  }, [fetchNews, fetchLastRefresh])
  
  // Reset news index when view mode or news data changes
  useEffect(() => {
    setCurrentNewsIndex(0)
  }, [viewMode, news])

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="text-5xl font-bold mb-6 text-[var(--pulp-orange)] glitch-effect font-['var(--font-orbitron)']" 
                 style={{textShadow: '0 0 20px var(--pulp-orange), 0 0 40px var(--pulp-orange), 0 0 60px var(--pulp-yellow)'}}>
              CAPTAIN FUTURE
            </div>
            <div className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)'] text-lg mb-4">
              <span className="typing-effect">COSMIC INTELLIGENCE NETWORK ACTIVATION</span>
            </div>
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-8 bg-[var(--pulp-orange)] rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
            <div className="text-muted-foreground font-['var(--font-share-tech-mono)']">
              Establishing cosmic communication channels...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10">
        <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} lastRefresh={lastRefresh} />
        
        <main className="container mx-auto px-4 py-8">
          {currentNews ? (
            <SingleNewsView
              news={currentNews}
              onNewsClicked={handleNewsClicked}
              onNewsRated={handleNewsRated}
              onReadLaterToggled={handleReadLaterToggled}
              onNext={handleNext}
              onPrevious={handlePrevious}
              currentIndex={currentNewsIndex}
              totalCount={getAllNewsItems().length}
              category={getCategoryForNews(currentNews)}
            />
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6 text-[var(--pulp-orange)]">
                🎉
              </div>
              <h2 className="text-2xl font-bold text-[var(--pulp-orange)] mb-4 font-['var(--font-orbitron)']">
                MISSION COMPLETE
              </h2>
              <p className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)']">
                {viewMode === 'readLater' 
                  ? 'Keine gespeicherten Artikel vorhanden'
                  : 'Alle News wurden verarbeitet'}
              </p>
              <button
                onClick={() => {
                  setViewMode('all')
                  setShowReadNews(true)
                  setShowUninteresting(true)
                  setCurrentNewsIndex(0)
                }}
                className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 rounded-lg border-2 border-[var(--pulp-orange)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-orange)] text-[var(--pulp-orange)] font-['var(--font-share-tech-mono)'] transition-all duration-300"
              >
                <RotateCcw className="w-5 h-5" />
                ALLE NEWS ANZEIGEN
              </button>
            </div>
          )}
        </main>
        
        <footer className="border-t-2 border-[var(--pulp-orange)]/30 bg-card/20 backdrop-blur-md mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--pulp-orange)]/5 to-transparent"></div>
          <div className="container mx-auto px-4 py-8 relative z-10">
            {/* View Mode Toggle Buttons */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
              <button
                onClick={() => handleViewModeChange('unread')}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-300 group font-['var(--font-share-tech-mono)'] font-medium ${
                  viewMode === 'unread' 
                    ? 'border-[var(--pulp-orange)] bg-[var(--pulp-orange)]/20 text-[var(--pulp-orange)] shadow-[0_0_20px_var(--pulp-orange)]'
                    : 'border-[var(--pulp-blue)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-blue)] text-[var(--pulp-blue)]'
                }`}
              >
                <Eye className="w-5 h-5" />
                <span>UNGELESENE NEWS</span>
              </button>

              <button
                onClick={() => handleViewModeChange('readLater')}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-300 group font-['var(--font-share-tech-mono)'] font-medium ${
                  viewMode === 'readLater'
                    ? 'border-[var(--pulp-orange)] bg-[var(--pulp-orange)]/20 text-[var(--pulp-orange)] shadow-[0_0_20px_var(--pulp-orange)]'
                    : 'border-[var(--pulp-blue)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-blue)] text-[var(--pulp-blue)]'
                }`}
              >
                <Bookmark className="w-5 h-5" />
                <span>SPÄTER LESEN</span>
              </button>

              <button
                onClick={() => handleViewModeChange('all')}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-300 group font-['var(--font-share-tech-mono)'] font-medium ${
                  viewMode === 'all'
                    ? 'border-[var(--pulp-orange)] bg-[var(--pulp-orange)]/20 text-[var(--pulp-orange)] shadow-[0_0_20px_var(--pulp-orange)]'
                    : 'border-[var(--pulp-blue)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-blue)] text-[var(--pulp-blue)]'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>ALLE NEWS</span>
              </button>
            </div>
            
            {/* Legacy filter buttons - only show in 'all' mode */}
            {viewMode === 'all' && (
              <div className="flex justify-center gap-4 mb-6 flex-wrap">
                <button
                  onClick={() => setShowReadNews(!showReadNews)}
                  className="flex items-center gap-3 px-6 py-3 rounded-lg border-2 border-[var(--pulp-blue)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-blue)] hover:shadow-[0_0_20px_var(--pulp-blue),inset_0_0_15px_rgba(0,212,255,0.1)] transition-all duration-300 group"
                >
                  {showReadNews ? (
                    <EyeOff className="w-5 h-5 text-[var(--pulp-red)] group-hover:text-[var(--pulp-blue)] transition-colors" />
                  ) : (
                    <Eye className="w-5 h-5 text-[var(--pulp-blue)] group-hover:text-[var(--pulp-orange)] transition-colors" />
                  )}
                  <span className="text-[var(--pulp-blue)] group-hover:text-[var(--pulp-orange)] font-['var(--font-share-tech-mono)'] font-medium transition-colors">
                    {showReadNews ? 'HIDE READ NEWS' : 'SHOW READ NEWS'}
                  </span>
                </button>

                <button
                  onClick={() => setShowUninteresting(!showUninteresting)}
                  className="flex items-center gap-3 px-6 py-3 rounded-lg border-2 border-[var(--pulp-red)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-red)] hover:shadow-[0_0_20px_var(--pulp-red),inset_0_0_15px_rgba(255,56,56,0.1)] transition-all duration-300 group"
                >
                  {showUninteresting ? (
                    <ThumbsUp className="w-5 h-5 text-[var(--pulp-green)] group-hover:text-[var(--pulp-red)] transition-colors" />
                  ) : (
                    <ThumbsDown className="w-5 h-5 text-[var(--pulp-red)] group-hover:text-[var(--pulp-green)] transition-colors" />
                  )}
                  <span className="text-[var(--pulp-red)] group-hover:text-[var(--pulp-green)] font-['var(--font-share-tech-mono)'] font-medium transition-colors">
                    {showUninteresting ? 'HIDE UNINTERESTING' : 'SHOW UNINTERESTING'}
                  </span>
                </button>
              </div>
            )}

            {/* Terminal Info */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-2 h-2 bg-[var(--pulp-orange)] rounded-full animate-pulse"></div>
                <p className="text-[var(--pulp-orange)] text-lg font-['var(--font-orbitron)'] font-bold">
                  CAPTAIN FUTURE AI NEWS
                </p>
                <div className="w-2 h-2 bg-[var(--pulp-orange)] rounded-full animate-pulse"></div>
              </div>
              <p className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)'] text-sm">
                Single-News Modus • Cosmic intelligence network active
              </p>
              <p className="text-muted-foreground font-['var(--font-share-tech-mono)'] text-xs mt-2">
                Aktueller Modus: {viewMode === 'unread' ? 'UNGELESENE NEWS' : 
                                  viewMode === 'readLater' ? 'SPÄTER LESEN' :
                                  'ALLE NEWS'} • 
                {currentNews ? `News ${currentNewsIndex + 1} von ${getAllNewsItems().length}` : 'Keine News verfügbar'}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}