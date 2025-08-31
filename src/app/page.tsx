'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { NewsGrid } from '@/components/NewsGrid'
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
        
        <footer className="border-t-2 border-[var(--pulp-orange)]/30 bg-card/20 backdrop-blur-md mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--pulp-orange)]/5 to-transparent"></div>
          <div className="container mx-auto px-4 py-8 relative z-10">
            {/* Toggle Buttons */}
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

            {/* Terminal Info */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-2 h-2 bg-[var(--pulp-orange)] rounded-full animate-pulse"></div>
                <p className="text-[var(--pulp-orange)] text-lg font-['var(--font-orbitron)'] font-bold">
                  AI NEWS
                </p>
                <div className="w-2 h-2 bg-[var(--pulp-orange)] rounded-full animate-pulse"></div>
              </div>
              <p className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)'] text-sm">
                Cosmic intelligence network active • Solar system scan: COMPLETE
              </p>
              <p className="text-muted-foreground font-['var(--font-share-tech-mono)'] text-xs mt-2">
                Filter mode: {showReadNews && showUninteresting ? 'ALL NEWS' : 
                             showReadNews ? 'ALL + INTERESTING' : 
                             showUninteresting ? 'UNREAD + ALL RATINGS' : 
                             'UNREAD + INTERESTING'} • Future-tech encryption: ENABLED
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
