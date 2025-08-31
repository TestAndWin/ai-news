import { Button } from "@/components/ui/button"
import { RefreshCw, Zap, LogOut } from "lucide-react"
import { api } from "@/lib/api-client"

interface HeaderProps {
  onRefresh: () => void
  isRefreshing: boolean
  lastRefresh?: {
    formatted: string
    relative: string
  } | null
}

export function Header({ onRefresh, isRefreshing, lastRefresh }: HeaderProps) {
  const handleLogout = async () => {
    await api.logout()
  }

  return (
    <header className="border-b border-[var(--pulp-orange)]/30 bg-card/20 backdrop-blur-md sticky top-0 z-50 relative overflow-hidden">
      {/* Scanning line effect */}
      <div className="absolute inset-0 scan-lines"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Zap className="w-10 h-10 text-[var(--pulp-orange)] heroic-glow" />
              <div className="absolute inset-0 w-10 h-10 border border-[var(--pulp-orange)]/50 rounded animate-spin"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-black text-[var(--pulp-orange)] font-['var(--font-orbitron)']" 
                  style={{textShadow: '0 0 15px var(--pulp-orange)'}}>
                AI News
              </h1>
              <div className="text-xs text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)'] mt-1">
                COSMIC INTELLIGENCE ACTIVE
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
            <div className="flex items-center gap-2 text-xs text-[var(--pulp-orange)] font-['var(--font-share-tech-mono)']">
              <div className="w-2 h-2 bg-[var(--pulp-orange)] rounded-full animate-pulse"></div>
              MISSION ACTIVE
            </div>
            
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="border-2 border-[var(--pulp-orange)] bg-background/30 hover:bg-[var(--pulp-orange)]/10 hover:shadow-[0_0_30px_var(--pulp-orange)] font-['var(--font-share-tech-mono)'] text-[var(--pulp-orange)] transition-all duration-300 relative overflow-hidden"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--pulp-orange)]/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'SCANNING...' : 'COSMIC SCAN'}
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-2 border-[var(--pulp-red)] bg-background/30 hover:bg-[var(--pulp-red)]/10 hover:shadow-[0_0_30px_var(--pulp-red)] font-['var(--font-share-tech-mono)'] text-[var(--pulp-red)] transition-all duration-300 relative overflow-hidden"
            >
              <LogOut className="w-4 h-4 mr-2" />
              MISSION END
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}