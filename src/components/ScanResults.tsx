'use client'

import { X, ArrowRight, Activity, Database, AlertTriangle } from 'lucide-react'
import { CompleteScanResult, ScanResult } from '@/lib/news-fetcher'

interface ScanResultsProps {
  scanResults: CompleteScanResult
  onClose: () => void
  onContinue: () => void
}

export function ScanResults({ scanResults, onClose, onContinue }: ScanResultsProps) {
  const { results, totalNewArticles, processedSources, scanStartedAt, scanCompletedAt } = scanResults

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = []
    }
    acc[result.category].push(result)
    return acc
  }, {} as Record<string, ScanResult[]>)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tech & Product News':
        return '🚀'
      case 'Research & Science':
        return '🔬'
      case 'Business & Society':
        return '🏢'
      default:
        return '📰'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Tech & Product News':
        return 'text-[var(--pulp-orange)]'
      case 'Research & Science':
        return 'text-[var(--pulp-blue)]'
      case 'Business & Society':
        return 'text-[var(--pulp-yellow)]'
      default:
        return 'text-[var(--pulp-orange)]'
    }
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const formattedScanStart = scanStartedAt ? formatTimestamp(new Date(scanStartedAt)) : null
  const formattedScanCompletion = scanCompletedAt ? formatTimestamp(new Date(scanCompletedAt)) : formatTimestamp(new Date())

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 overflow-y-auto">
      <div className="relative min-h-screen">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-3 rounded-full border-2 border-[var(--pulp-orange)]/30 bg-card/40 backdrop-blur-sm hover:border-[var(--pulp-orange)] text-[var(--pulp-orange)] transition-all duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Activity className="w-8 h-8 text-[var(--pulp-orange)] animate-pulse" />
              <h1 className="text-4xl font-bold text-[var(--pulp-orange)] font-['var(--font-orbitron)'] glitch-effect"
                  style={{ textShadow: '0 0 20px var(--pulp-orange), 0 0 40px var(--pulp-orange)' }}>
                COSMIC SCAN COMPLETE
              </h1>
              <Activity className="w-8 h-8 text-[var(--pulp-orange)] animate-pulse" />
            </div>

            <div className="text-sm md:text-base text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)'] mb-6">
              {formattedScanStart ? (
                <span>
                  Suche nach neuen News seit {formattedScanStart} &mdash; Abschluss um {formattedScanCompletion}
                </span>
              ) : (
                <span>Erste Missionssuche abgeschlossen um {formattedScanCompletion}</span>
              )}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border-2 border-[var(--pulp-orange)]/30 bg-card/40 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold text-[var(--pulp-orange)] mb-2 font-['var(--font-orbitron)']">
                  {totalNewArticles}
                </div>
                <div className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)']">
                  NEW ARTICLES FOUND
                </div>
              </div>
              <div className="border-2 border-[var(--pulp-blue)]/30 bg-card/40 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold text-[var(--pulp-blue)] mb-2 font-['var(--font-orbitron)']">
                  {processedSources}
                </div>
                <div className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)']">
                  SOURCES SCANNED
                </div>
              </div>
              <div className="border-2 border-[var(--pulp-yellow)]/30 bg-card/40 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold text-[var(--pulp-yellow)] mb-2 font-['var(--font-orbitron)']">
                  {Object.keys(groupedResults).length}
                </div>
                <div className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)']">
                  CATEGORIES
                </div>
              </div>
            </div>

            {totalNewArticles === 0 && (
              <div className="mb-8 p-6 border-2 border-[var(--pulp-yellow)]/30 bg-card/20 backdrop-blur-sm rounded-lg">
                <Database className="w-12 h-12 text-[var(--pulp-yellow)] mx-auto mb-4" />
                <p className="text-[var(--pulp-yellow)] font-['var(--font-share-tech-mono)'] text-lg">
                  NO NEW ARTICLES DETECTED
                </p>
                <p className="text-muted-foreground font-['var(--font-share-tech-mono)'] text-sm mt-2">
                  All sources scanned - database is up to date
                </p>
              </div>
            )}
          </div>

          {/* Results by category */}
          <div className="space-y-8">
            {Object.entries(groupedResults).map(([category, categoryResults]) => {
              const categoryTotal = categoryResults.reduce((sum, result) => sum + result.newArticles, 0)
              const hasErrors = categoryResults.some(result => result.error)

              return (
                <div key={category} className="border-2 border-[var(--pulp-orange)]/20 bg-card/20 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <h2 className={`text-2xl font-bold font-['var(--font-orbitron)'] ${getCategoryColor(category)}`}>
                        {category.toUpperCase()}
                      </h2>
                      {hasErrors && (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div className={`text-lg font-bold font-['var(--font-share-tech-mono)'] ${getCategoryColor(category)}`}>
                      {categoryTotal} NEW
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryResults.map((result, index) => (
                      <div
                        key={`${result.sourceName}-${index}`}
                        className={`p-4 rounded-lg border-2 backdrop-blur-sm transition-all duration-300 ${
                          result.error
                            ? 'border-red-500/30 bg-red-500/10 hover:border-red-500/50'
                            : result.newArticles > 0
                              ? 'border-[var(--pulp-orange)]/30 bg-[var(--pulp-orange)]/5 hover:border-[var(--pulp-orange)]/50'
                              : 'border-muted/30 bg-card/20 hover:border-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground mb-1 font-['var(--font-share-tech-mono)']">
                              {result.sourceName}
                            </h3>
                            {result.error ? (
                              <p className="text-red-400 text-sm font-['var(--font-share-tech-mono)']">
                                ERROR: {result.error}
                              </p>
                            ) : (
                              <p className="text-muted-foreground text-sm font-['var(--font-share-tech-mono)']">
                                {result.newArticles} new article{result.newArticles !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          <div className={`text-2xl font-bold font-['var(--font-orbitron)'] ${
                            result.error
                              ? 'text-red-400'
                              : result.newArticles > 0
                                ? 'text-[var(--pulp-orange)]'
                                : 'text-muted-foreground'
                          }`}>
                            {result.error ? '⚠' : result.newArticles}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Continue button */}
          <div className="text-center mt-12">
            <button
              onClick={onContinue}
              className="group flex items-center gap-3 mx-auto px-8 py-4 rounded-lg border-2 border-[var(--pulp-orange)]/30 bg-[var(--pulp-orange)]/10 backdrop-blur-sm hover:border-[var(--pulp-orange)] hover:bg-[var(--pulp-orange)]/20 text-[var(--pulp-orange)] font-['var(--font-share-tech-mono)'] font-bold text-lg transition-all duration-300 hover:shadow-[0_0_30px_var(--pulp-orange)]"
            >
              <span>CONTINUE TO NEWS</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <p className="text-muted-foreground font-['var(--font-share-tech-mono)'] text-sm mt-4">
              Press SPACE or click to view the cosmic news feed
            </p>
          </div>
        </div>

        {/* Scanning lines effect */}
        <div className="absolute inset-0 scan-lines pointer-events-none opacity-10"></div>
      </div>
    </div>
  )
}
