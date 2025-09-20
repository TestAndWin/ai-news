'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/Header'
import { SingleNewsView } from '@/components/SingleNewsView'
import { ScanResults } from '@/components/ScanResults'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { CompleteScanResult } from '@/lib/news-fetcher'
import { Building2, Eye, Bookmark, RotateCcw, Star, RefreshCw, CheckCircle2, LogOut } from 'lucide-react'

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

type ViewMode = 'unread' | 'readLater' | 'interesting' | 'all'

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
  const [lastRefresh, setLastRefresh] = useState<{
    formatted: string
    relative: string
  } | null>(null)
  const [showScanResults, setShowScanResults] = useState(false)
  const [scanResults, setScanResults] = useState<CompleteScanResult | null>(null)

  // Get all news items as flat array - no filtering needed as it's done by backend
  const getAllNewsItems = useCallback(() => {
    return [...news.techNews, ...news.researchNews, ...news.businessNews]
  }, [news])

  const allNewsItems = getAllNewsItems()
  const currentNews = allNewsItems[currentNewsIndex]
  
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
    setCurrentNewsIndex(prev => {
      const allNews = getAllNewsItems()
      return prev < allNews.length - 1 ? prev + 1 : prev
    })
  }, [getAllNewsItems])

  const handlePrevious = useCallback(() => {
    setCurrentNewsIndex(prev => prev > 0 ? prev - 1 : prev)
  }, [])

  const handleCloseScanResults = useCallback(() => {
    setShowScanResults(false)
    setScanResults(null)
  }, [])

  const handleContinueFromScanResults = useCallback(() => {
    setShowScanResults(false)
    // Don't clear scan results in case user wants to view them again
  }, [])

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

  const fetchNews = useCallback(async (viewModeParam?: ViewMode) => {
    try {
      const currentViewMode = viewModeParam || viewMode
      const data = await api.get(`/api/news?viewMode=${currentViewMode}`)
      setNews(data)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [viewMode])

  const handleViewModeChange = useCallback(async (newMode: ViewMode) => {
    setViewMode(newMode)
    setCurrentNewsIndex(0)
    setIsLoading(true)
    await fetchNews(newMode)
  }, [fetchNews])

  const handleLogout = useCallback(async () => {
    try {
      await api.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }, [])

  // Keyboard shortcuts
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    // If scan results are shown, handle space key to continue
    if (showScanResults && e.key === ' ') {
      e.preventDefault()
      handleContinueFromScanResults()
      return
    }

    // Regular keyboard shortcuts (only when scan results are not shown)
    if (!showScanResults) {
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
    }
  }, [currentNews, handleNewsClicked, handleNewsRated, handleReadLaterToggled, handleNext, handlePrevious, showScanResults, handleContinueFromScanResults])

  const handleMarkAllRead = useCallback(async () => {
    try {
      const response = await api.post('/api/news/mark-all-read')
      if (response.success) {
        console.log(response.message)
        // Refresh the current view to show updated counts
        await fetchNews()
      }
    } catch (error) {
      console.error('Error marking all articles as read:', error)
    }
  }, [fetchNews])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await api.post('/api/news/fetch')

      // Check if we got scan results
      if (response.type === 'full-scan' && response.scanResults) {
        setScanResults(response.scanResults)
        setShowScanResults(true)
      }

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
  
  // Reset news index when view mode changes
  useEffect(() => {
    setCurrentNewsIndex(0)
  }, [viewMode])

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="text-5xl font-bold mb-6 text-[var(--pulp-orange)] glitch-effect font-['var(--font-orbitron)']"
                 style={{textShadow: '0 0 20px var(--pulp-orange), 0 0 40px var(--pulp-orange), 0 0 60px var(--pulp-yellow)'}}>
              AI NEWS
            </div>
            <div className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)'] text-lg mb-4">
              <span className="typing-effect">COSMIC INTELLIGENCE <br/>NETWORK ACTIVATION</span>
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

  const renderViewModeButtons = (wrapperClass: string) => (
    <div className={wrapperClass}>
      <Button
        onClick={() => handleViewModeChange('unread')}
        variant="outline"
        className={`w-full md:w-auto border-2 bg-background/30 font-['var(--font-share-tech-mono)'] transition-all duration-300 relative overflow-hidden ${
          viewMode === 'unread'
            ? 'border-[var(--pulp-orange)] text-[var(--pulp-orange)] shadow-[0_0_20px_var(--pulp-orange)] bg-[var(--pulp-orange)]/15'
            : 'border-[var(--pulp-blue)]/30 text-[var(--pulp-blue)] hover:border-[var(--pulp-blue)] hover:bg-[var(--pulp-blue)]/10'
        }`}
      >
        <Eye className="w-4 h-4 mr-2" />
        UNREAD NEWS
      </Button>

      <Button
        onClick={() => handleViewModeChange('readLater')}
        variant="outline"
        className={`w-full md:w-auto border-2 bg-background/30 font-['var(--font-share-tech-mono)'] transition-all duration-300 relative overflow-hidden ${
          viewMode === 'readLater'
            ? 'border-[var(--pulp-orange)] text-[var(--pulp-orange)] shadow-[0_0_20px_var(--pulp-orange)] bg-[var(--pulp-orange)]/15'
            : 'border-[var(--pulp-blue)]/30 text-[var(--pulp-blue)] hover:border-[var(--pulp-blue)] hover:bg-[var(--pulp-blue)]/10'
        }`}
      >
        <Bookmark className="w-4 h-4 mr-2" />
        READ LATER
      </Button>

      <Button
        onClick={() => handleViewModeChange('interesting')}
        variant="outline"
        className={`w-full md:w-auto border-2 bg-background/30 font-['var(--font-share-tech-mono)'] transition-all duration-300 relative overflow-hidden ${
          viewMode === 'interesting'
            ? 'border-[var(--pulp-orange)] text-[var(--pulp-orange)] shadow-[0_0_20px_var(--pulp-orange)] bg-[var(--pulp-orange)]/15'
            : 'border-[var(--pulp-blue)]/30 text-[var(--pulp-blue)] hover:border-[var(--pulp-blue)] hover:bg-[var(--pulp-blue)]/10'
        }`}
      >
        <Star className="w-4 h-4 mr-2" />
        INTERESTING NEWS
      </Button>

      <Button
        onClick={() => handleViewModeChange('all')}
        variant="outline"
        className={`w-full md:w-auto border-2 bg-background/30 font-['var(--font-share-tech-mono)'] transition-all duration-300 relative overflow-hidden ${
          viewMode === 'all'
            ? 'border-[var(--pulp-orange)] text-[var(--pulp-orange)] shadow-[0_0_20px_var(--pulp-orange)] bg-[var(--pulp-orange)]/15'
            : 'border-[var(--pulp-blue)]/30 text-[var(--pulp-blue)] hover:border-[var(--pulp-blue)] hover:bg-[var(--pulp-blue)]/10'
        }`}
      >
        <Building2 className="w-4 h-4 mr-2" />
        ALL NEWS
      </Button>
    </div>
  )

  const mobileMissionActions = (
    <div className="md:hidden mt-4 mb-2 flex flex-col gap-3">
      <Button
        onClick={handleRefresh}
        disabled={isRefreshing}
        variant="outline"
        className="w-full border-2 border-[var(--pulp-orange)] bg-background/30 hover:bg-[var(--pulp-orange)]/10 hover:shadow-[0_0_30px_var(--pulp-orange)] font-['var(--font-share-tech-mono)'] text-[var(--pulp-orange)] transition-all duration-300 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--pulp-orange)]/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'SCANNING...' : 'COSMIC SCAN'}
      </Button>

      <Button
        onClick={handleMarkAllRead}
        variant="outline"
        className="w-full border-2 border-[var(--pulp-blue)] bg-background/30 hover:bg-[var(--pulp-blue)]/10 hover:shadow-[0_0_30px_var(--pulp-blue)] font-['var(--font-share-tech-mono)'] text-[var(--pulp-blue)] transition-all duration-300 relative overflow-hidden"
      >
        <CheckCircle2 className="w-4 h-4 mr-2" />
        MARK ALL READ
      </Button>

      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full border-2 border-[var(--pulp-red)] bg-background/30 hover:bg-[var(--pulp-red)]/10 hover:shadow-[0_0_30px_var(--pulp-red)] font-['var(--font-share-tech-mono)'] text-[var(--pulp-red)] transition-all duration-300 relative overflow-hidden"
      >
        <LogOut className="w-4 h-4 mr-2" />
        MISSION END
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Show scan results overlay if available */}
      {showScanResults && scanResults && (
        <ScanResults
          scanResults={scanResults}
          onClose={handleCloseScanResults}
          onContinue={handleContinueFromScanResults}
        />
      )}

      <div className="relative z-10">
        <Header
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onMarkAllRead={handleMarkAllRead}
          onLogout={handleLogout}
          lastRefresh={lastRefresh}
        />
        
        <main className="container mx-auto px-4 py-8">
          {currentNews ? (
            <>
              <SingleNewsView
                news={currentNews}
                onNewsClicked={handleNewsClicked}
                onNewsRated={handleNewsRated}
                onReadLaterToggled={handleReadLaterToggled}
                onNext={handleNext}
                onPrevious={handlePrevious}
                currentIndex={currentNewsIndex}
                totalCount={allNewsItems.length}
                category={getCategoryForNews(currentNews)}
              />

            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6 text-[var(--pulp-orange)]">
                🎉
              </div>
              <h2 className="text-2xl font-bold text-[var(--pulp-orange)] mb-4 font-['var(--font-orbitron)']">
                MISSION COMPLETE
              </h2>
              <p className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)']">
                {viewMode === 'readLater' ? 'No saved articles available' :
                 viewMode === 'interesting' ? 'No interesting articles found' :
                 'All news processed'}
              </p>
              <button
                onClick={() => handleViewModeChange('all')}
                className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 rounded-lg border-2 border-[var(--pulp-orange)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-orange)] text-[var(--pulp-orange)] font-['var(--font-share-tech-mono)'] transition-all duration-300"
              >
                <RotateCcw className="w-5 h-5" />
                SHOW ALL NEWS
              </button>
            </div>
          )}

          <div className="md:hidden h-px w-full bg-[var(--pulp-orange)]/30 mt-6 mb-8"></div>
          {renderViewModeButtons('md:hidden flex flex-col gap-3 mt-8')}
          <div className="md:hidden h-px w-full bg-[var(--pulp-orange)]/30 my-3"></div>
          {mobileMissionActions}
        </main>
        
        <footer className="border-t-2 border-[var(--pulp-orange)]/30 bg-card/20 backdrop-blur-md relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--pulp-orange)]/5 to-transparent"></div>
          <div className="container mx-auto px-4 py-8 relative z-10">
            {/* View Mode Toggle Buttons */}
            {renderViewModeButtons('hidden md:flex md:flex-row md:flex-wrap gap-3 md:gap-4 justify-center mb-6')}
            

            {/* Terminal Info */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-2 h-2 bg-[var(--pulp-orange)] rounded-full animate-pulse"></div>
                <p className="text-[var(--pulp-orange)] text-lg font-['var(--font-orbitron)'] font-bold">
                  AI NEWS
                </p>
                <div className="w-2 h-2 bg-[var(--pulp-orange)] rounded-full animate-pulse"></div>
              </div>
              <p className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)'] text-sm whitespace-pre-line">
                Cosmic intelligence
                <br className="sm:hidden" />
                <span className="sm:hidden">network active</span>
                <span className="hidden sm:inline"> network active</span>
              </p>
              <p className="text-muted-foreground font-['var(--font-share-tech-mono)'] text-xs mt-2">
                Current mode: {viewMode === 'unread' ? 'UNREAD NEWS' : 
                                  viewMode === 'readLater' ? 'READ later' :
                                  viewMode === 'interesting' ? 'INTERESTING NEWS' :
                                  'ALL NEWS'} • 
                {currentNews ? `News ${currentNewsIndex + 1} of ${allNewsItems.length}` : 'No news available'}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
