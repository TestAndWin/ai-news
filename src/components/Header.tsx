import { Button } from "@/components/ui/button"
import { RefreshCw, Zap, LogOut, CheckCircle2 } from "lucide-react"

interface HeaderProps {
  onRefresh: () => void
  isRefreshing: boolean
  onMarkAllRead: () => void
  onLogout: () => void
  lastRefresh?: {
    formatted: string
    relative: string
  } | null
}

export function Header({ onRefresh, isRefreshing, onMarkAllRead, onLogout, lastRefresh }: HeaderProps) {
  return (
    <header className="border-b border-[var(--pulp-orange)]/30 bg-card/20 backdrop-blur-md sticky top-0 z-50 relative overflow-hidden">
      {/* Scanning line effect */}
      <div className="absolute inset-0 scan-lines"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <Zap className="w-10 h-10 text-[var(--pulp-orange)] heroic-glow" />
              <div className="absolute inset-0 w-10 h-10 border border-[var(--pulp-orange)]/50 rounded animate-spin"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl sm:text-4xl font-black text-[var(--pulp-orange)] font-['var(--font-orbitron)']" 
                  style={{textShadow: '0 0 15px var(--pulp-orange)'}}>
                AI News
              </h1>
              <div className="text-xs text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)'] mt-1">
                COSMIC INTELLIGENCE ACTIVE
                {lastRefresh && (
                  <>
                    <span className="text-muted-foreground hidden sm:inline mx-2">•</span>
                    <span className="text-muted-foreground sm:hidden"> •</span>
                    <br className="sm:hidden" />
                    <span title={lastRefresh.formatted}>
                      Last Updated: {lastRefresh.relative}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-end">
            {/* Status indicator */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end text-xs text-[var(--pulp-orange)] font-['var(--font-share-tech-mono)']">
              <div className="w-2 h-2 bg-[var(--pulp-orange)] rounded-full animate-pulse"></div>
              MISSION ACTIVE
            </div>
            
            <div className="hidden md:flex md:flex-wrap md:items-center md:justify-end gap-3 w-full md:w-auto">
              <Button
                onClick={onRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="w-full md:w-auto border-2 border-[var(--pulp-orange)] bg-background/30 hover:bg-[var(--pulp-orange)]/10 hover:shadow-[0_0_30px_var(--pulp-orange)] font-['var(--font-share-tech-mono)'] text-[var(--pulp-orange)] transition-all duration-300 relative overflow-hidden"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--pulp-orange)]/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>

                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'SCANNING...' : 'COSMIC SCAN'}
              </Button>

              <Button
                onClick={onMarkAllRead}
                variant="outline"
                className="w-full md:w-auto border-2 border-[var(--pulp-blue)] bg-background/30 hover:bg-[var(--pulp-blue)]/10 hover:shadow-[0_0_30px_var(--pulp-blue)] font-['var(--font-share-tech-mono)'] text-[var(--pulp-blue)] transition-all duration-300 relative overflow-hidden"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                MARK ALL READ
              </Button>

              <Button
                onClick={onLogout}
                variant="outline"
                className="w-full md:w-auto border-2 border-[var(--pulp-red)] bg-background/30 hover:bg-[var(--pulp-red)]/10 hover:shadow-[0_0_30px_var(--pulp-red)] font-['var(--font-share-tech-mono)'] text-[var(--pulp-red)] transition-all duration-300 relative overflow-hidden"
              >
                <LogOut className="w-4 h-4 mr-2" />
                MISSION END
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
