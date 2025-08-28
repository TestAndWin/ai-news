import { Button } from "@/components/ui/button"
import { RefreshCw, Zap } from "lucide-react"

interface HeaderProps {
  onRefresh: () => void
  isRefreshing: boolean
  lastRefresh?: {
    formatted: string
    relative: string
  } | null
}

export function Header({ onRefresh, isRefreshing, lastRefresh }: HeaderProps) {
  return (
    <header className="border-b border-[#00ff88]/30 bg-card/20 backdrop-blur-md sticky top-0 z-50 relative overflow-hidden">
      {/* Scanning line effect */}
      <div className="absolute inset-0 scan-lines"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Zap className="w-10 h-10 text-[#00ff88] neon-glow" />
              <div className="absolute inset-0 w-10 h-10 border border-[#00ff88]/50 rounded animate-spin"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-black text-[#00ff88] font-['var(--font-orbitron)']" 
                  style={{textShadow: '0 0 15px #00ff88'}}>
                AI NEWS TERMINAL
              </h1>
              <div className="text-xs text-[#00f5ff] font-['var(--font-share-tech-mono)'] mt-1">
                NEURAL NETWORK ACTIVE
                {lastRefresh && (
                  <>
                    <span className="text-muted-foreground mx-2">•</span>
                    <span title={lastRefresh.formatted}>
                      Last Updated: {lastRefresh.relative}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="flex items-center gap-2 text-xs text-[#00ff88] font-['var(--font-share-tech-mono)']">
              <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
              ONLINE
            </div>
            
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="border-2 border-[#00ff88] bg-background/30 hover:bg-[#00ff88]/10 hover:shadow-[0_0_30px_#00ff88] font-['var(--font-share-tech-mono)'] text-[#00ff88] transition-all duration-300 relative overflow-hidden"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff88]/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'UPDATING...' : 'REFRESH DATA'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}