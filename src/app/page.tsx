'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { NewsGrid } from '@/components/NewsGrid'
import { MatrixRain } from '@/components/MatrixRain'
import { api } from '@/lib/api-client'
import { Cpu, Microscope, Building2, Eye, EyeOff, ThumbsDown, ThumbsUp } from 'lucide-react'

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

interface NewsData {
  techNews: NewsItem[]
  researchNews: NewsItem[]
  businessNews: NewsItem[]
}

export default function Home() {
  const [news, setNews] = useState<NewsData>({
    techNews: [],
    researchNews: [],
    businessNews: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showReadNews, setShowReadNews] = useState(false)
  const [showUninteresting, setShowUninteresting] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<{
    formatted: string
    relative: string
  } | null>(null)


  const handleNewsClicked = (clickedId: string) => {
    // Update the news state to mark the clicked item as read
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
  }

  const handleNewsRated = (ratedId: string, rating: number | null) => {
    // Update the news state to reflect the rating
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
  }

  const fetchLastRefresh = async () => {
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
      // API client handles authentication failures automatically
    }
  }

  const fetchNews = async () => {
    try {
      const data = await api.get('/api/news')
      setNews(data)
    } catch (error) {
      console.error('Error fetching news:', error)
      // API client handles authentication failures automatically
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Use authenticated API client for news fetch
      await api.post('/api/news/fetch')
      
      // Update timestamp after successful fetch
      await api.post('/api/metadata/last-refresh', { 
        timestamp: new Date().toISOString() 
      })
      
      await fetchNews()
      await fetchLastRefresh() // Refresh timestamp display
    } catch (error) {
      console.error('Error refreshing news:', error)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchNews()
    fetchLastRefresh()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <MatrixRain />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="text-5xl font-bold mb-6 text-[#00ff88] glitch-effect font-['var(--font-orbitron)']" 
                 style={{textShadow: '0 0 20px #00ff88, 0 0 40px #00ff88, 0 0 60px #00ff88'}}>
              INITIALIZING...
            </div>
            <div className="text-[#00f5ff] font-['var(--font-share-tech-mono)'] text-lg mb-4">
              <span className="typing-effect">NEURAL NETWORK ACTIVATION IN PROGRESS</span>
            </div>
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-8 bg-[#00ff88] rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
            <div className="text-muted-foreground font-['var(--font-share-tech-mono)']">
              Establishing secure data links...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MatrixRain />
      <div className="relative z-10">
        <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} lastRefresh={lastRefresh} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:items-stretch">
            <div className="flex flex-col animate-[fadeInUp_0.8s_ease-out]" style={{ animationDelay: '0.2s' }}>
              <NewsGrid
                news={news.techNews}
                title="TECH & PRODUCT"
                icon={<Cpu className="w-6 h-6" />}
                showReadNews={showReadNews}
                showUninteresting={showUninteresting}
                onNewsClicked={handleNewsClicked}
                onNewsRated={handleNewsRated}
              />
            </div>
            
            <div className="flex flex-col animate-[fadeInUp_0.8s_ease-out]" style={{ animationDelay: '0.4s' }}>
              <NewsGrid
                news={news.researchNews}
                title="RESEARCH & SCIENCE"
                icon={<Microscope className="w-6 h-6" />}
                showReadNews={showReadNews}
                showUninteresting={showUninteresting}
                onNewsClicked={handleNewsClicked}
                onNewsRated={handleNewsRated}
              />
            </div>
            
            <div className="flex flex-col animate-[fadeInUp_0.8s_ease-out]" style={{ animationDelay: '0.6s' }}>
              <NewsGrid
                news={news.businessNews}
                title="BUSINESS & SOCIETY"
                icon={<Building2 className="w-6 h-6" />}
                showReadNews={showReadNews}
                showUninteresting={showUninteresting}
                onNewsClicked={handleNewsClicked}
                onNewsRated={handleNewsRated}
              />
            </div>
          </div>
        </main>
        
        <footer className="border-t-2 border-[#00ff88]/30 bg-card/20 backdrop-blur-md mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff88]/5 to-transparent"></div>
          <div className="container mx-auto px-4 py-8 relative z-10">
            {/* Toggle Buttons */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
              <button
                onClick={() => setShowReadNews(!showReadNews)}
                className="flex items-center gap-3 px-6 py-3 rounded-lg border-2 border-[#00f5ff]/30 bg-card/40 backdrop-blur-sm hover:border-[#00f5ff] hover:shadow-[0_0_20px_#00f5ff,inset_0_0_15px_rgba(0,245,255,0.1)] transition-all duration-300 group"
              >
                {showReadNews ? (
                  <EyeOff className="w-5 h-5 text-[#ff0080] group-hover:text-[#00f5ff] transition-colors" />
                ) : (
                  <Eye className="w-5 h-5 text-[#00f5ff] group-hover:text-[#00ff88] transition-colors" />
                )}
                <span className="text-[#00f5ff] group-hover:text-[#00ff88] font-['var(--font-share-tech-mono)'] font-medium transition-colors">
                  {showReadNews ? 'HIDE READ NEWS' : 'SHOW READ NEWS'}
                </span>
              </button>

              <button
                onClick={() => setShowUninteresting(!showUninteresting)}
                className="flex items-center gap-3 px-6 py-3 rounded-lg border-2 border-[#ff0080]/30 bg-card/40 backdrop-blur-sm hover:border-[#ff0080] hover:shadow-[0_0_20px_#ff0080,inset_0_0_15px_rgba(255,0,128,0.1)] transition-all duration-300 group"
              >
                {showUninteresting ? (
                  <ThumbsUp className="w-5 h-5 text-[#00ff88] group-hover:text-[#ff0080] transition-colors" />
                ) : (
                  <ThumbsDown className="w-5 h-5 text-[#ff0080] group-hover:text-[#00ff88] transition-colors" />
                )}
                <span className="text-[#ff0080] group-hover:text-[#00ff88] font-['var(--font-share-tech-mono)'] font-medium transition-colors">
                  {showUninteresting ? 'HIDE UNINTERESTING' : 'SHOW UNINTERESTING'}
                </span>
              </button>
            </div>

            {/* Terminal Info */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
                <p className="text-[#00ff88] text-lg font-['var(--font-orbitron)'] font-bold">
                  AI NEWS TERMINAL
                </p>
                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
              </div>
              <p className="text-[#00f5ff] font-['var(--font-share-tech-mono)'] text-sm">
                Neural network synchronization complete • Data streams: ACTIVE
              </p>
              <p className="text-muted-foreground font-['var(--font-share-tech-mono)'] text-xs mt-2">
                Filter mode: {showReadNews && showUninteresting ? 'ALL NEWS' : 
                             showReadNews ? 'ALL + INTERESTING' : 
                             showUninteresting ? 'UNREAD + ALL RATINGS' : 
                             'UNREAD + INTERESTING'} • Quantum encryption: ENABLED
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
