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
  const uninterestingCount = news.filter(item => item.rating === 1).length
  const totalCount = news.length
  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Enhanced section header */}
      <div className="relative group">
        <div className="flex items-center gap-4 p-4 rounded-lg border border-[#00ff88]/30 bg-card/20 backdrop-blur-sm">
          {icon && (
            <div className="text-[#00ff88] neon-glow p-2 rounded border border-[#00ff88]/50 bg-[#00ff88]/5">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#00ff88] font-['var(--font-orbitron)']" 
                style={{textShadow: '0 0 15px #00ff88, 0 0 30px #00ff88'}}>
              {title}
            </h2>
            <div className="text-xs font-['var(--font-share-tech-mono)'] mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-[#00ff88]">{unreadCount} UNREAD</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[#00ff88]">{interestingCount} INTERESTING</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[#00f5ff]">{totalCount} TOTAL</span>
            </div>
          </div>
          
          {/* Data stream indicator */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 h-6 bg-[#00ff88] rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
            <span className="text-xs text-[#00f5ff] font-['var(--font-share-tech-mono)']">LIVE</span>
          </div>
        </div>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-[#00ff88]/50 to-[#00f5ff]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
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
        <div className="flex-1 flex items-center justify-center border-2 border-[#ff0080]/30 bg-card/20 backdrop-blur-sm rounded-lg p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff0080]/5 to-transparent animate-pulse"></div>
          <div className="relative z-10">
            <p className="text-[#ff0080] font-['var(--font-share-tech-mono)'] text-lg">
              {showReadNews && showUninteresting ? 'NO DATA STREAMS AVAILABLE' : 
               !showReadNews && !showUninteresting ? 'ALL RELEVANT NEWS READ' :
               !showReadNews ? 'ALL NEWS READ' : 
               'NO INTERESTING NEWS'}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {showReadNews && showUninteresting ? 'Waiting for neural network input...' :
               'Use footer toggles to show filtered content'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}