import { NewsCard } from "./NewsCard"

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

interface NewsGridProps {
  news: NewsItem[]
  title: string
  icon?: React.ReactNode
  showReadNews?: boolean
  showUninteresting?: boolean
  onNewsClicked?: (id: string) => void
  onNewsRated?: (id: string, rating: number | null) => void
}

export function NewsGrid({ news, title, icon, showReadNews = false, showUninteresting = false, onNewsClicked, onNewsRated }: NewsGridProps) {
  // Filter news based on showReadNews and showUninteresting states
  let filteredNews = news
  
  // First filter by read status
  if (!showReadNews) {
    filteredNews = filteredNews.filter(item => !item.clicked)
  }
  
  // Then filter by rating (hide thumbs down unless showUninteresting is true)
  if (!showUninteresting) {
    filteredNews = filteredNews.filter(item => item.rating !== 1)
  }
  
  const unreadCount = news.filter(item => !item.clicked).length
  const interestingCount = news.filter(item => item.rating === 2).length
  const totalCount = news.length
  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Enhanced section header */}
      <div className="relative group">
        <div className="flex items-center gap-4 p-4 rounded-lg border border-[var(--pulp-orange)]/30 bg-card/20 backdrop-blur-sm">
          {icon && (
            <div className="text-[var(--pulp-orange)] heroic-glow p-2 rounded border border-[var(--pulp-orange)]/50 bg-[var(--pulp-orange)]/5">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[var(--pulp-orange)] font-['var(--font-orbitron)']" 
                style={{textShadow: '0 0 15px var(--pulp-orange), 0 0 30px var(--pulp-orange)'}}>
              {title}
            </h2>
            <div className="text-xs font-['var(--font-share-tech-mono)'] mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-[var(--pulp-orange)]">{unreadCount} UNREAD</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[var(--pulp-orange)]">{interestingCount} INTERESTING</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[var(--pulp-blue)]">{totalCount} TOTAL</span>
            </div>
          </div>
          
          {/* Data stream indicator */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 h-6 bg-[var(--pulp-orange)] rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
            <span className="text-xs text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)']">ACTIVE</span>
          </div>
        </div>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-[var(--pulp-orange)]/50 to-[var(--pulp-blue)]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        <div className="absolute inset-[2px] rounded-lg bg-card/20 backdrop-blur-sm -z-10"></div>
      </div>
      
      {filteredNews.length > 0 ? (
        <div className="flex-1 grid gap-6 md:grid-cols-2 lg:grid-cols-1 auto-rows-fr transition-all duration-500 ease-in-out">
          {filteredNews.map((item, index) => (
            <div 
              key={item.id}
              className="animate-[fadeInUp_0.6s_ease-out] transition-all duration-300 ease-in-out"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <NewsCard news={item} onNewsClicked={onNewsClicked} onNewsRated={onNewsRated} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border-2 border-[var(--pulp-red)]/30 bg-card/20 backdrop-blur-sm rounded-lg p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--pulp-red)]/5 to-transparent animate-pulse"></div>
          <div className="relative z-10">
            <p className="text-[var(--pulp-red)] font-['var(--font-share-tech-mono)'] text-lg">
              {showReadNews && showUninteresting ? 'NO COSMIC INTELLIGENCE AVAILABLE' : 
               !showReadNews && !showUninteresting ? 'ALL CRITICAL MISSIONS REVIEWED' :
               !showReadNews ? 'ALL TRANSMISSIONS RECEIVED' : 
               'NO PRIORITY MISSIONS'}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {showReadNews && showUninteresting ? 'Awaiting cosmic communication...' :
               'Use command toggles to access archived data'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}