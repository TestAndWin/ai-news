'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { Lock, Eye, EyeOff, Rocket } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await api.login(password)
      
      if (success) {
        router.push('/')
      } else {
        setError('COSMIC ACCESS DENIED - INVALID CREDENTIALS')
      }
    } catch {
      setError('COMMUNICATION ERROR - COSMIC LINK FAILED')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="flex items-center justify-center min-h-screen relative z-10 px-4">
        <div className="w-full max-w-md">
          {/* AI News Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Rocket className="w-8 h-8 text-[var(--pulp-orange)]" />
              <div className="text-4xl font-bold text-[var(--pulp-orange)] glitch-effect font-['var(--font-orbitron)']"
                   style={{textShadow: '0 0 20px var(--pulp-orange), 0 0 40px var(--pulp-orange), 0 0 60px var(--pulp-yellow)'}}>
                AI NEWS
              </div>
            </div>
            <div className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)'] text-sm">
              <span className="typing-effect block">
                COSMIC INTELLIGENCE AUTHORIZATION
                <br />
                • FUTURE-TECH SECURITY
              </span>
            </div>
          </div>

          {/* Login Form */}
          <div className="border-2 border-[var(--pulp-orange)]/30 rounded-lg bg-card/20 backdrop-blur-md p-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--pulp-orange)]/5 via-transparent to-[var(--pulp-blue)]/5 rounded-lg"></div>
            
            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-[var(--pulp-orange)] font-['var(--font-share-tech-mono)'] text-sm font-medium">
                  COSMIC ACCESS CODE
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--pulp-blue)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-black/40 border-2 border-[var(--pulp-blue)]/30 rounded-lg 
                             text-[var(--pulp-orange)] placeholder-[var(--pulp-blue)]/50 font-['var(--font-share-tech-mono)']
                             focus:border-[var(--pulp-blue)] focus:ring-0 focus:outline-none
                             hover:border-[var(--pulp-blue)]/60 transition-colors"
                    placeholder="Enter cosmic access code..."
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--pulp-blue)] 
                             hover:text-[var(--pulp-orange)] transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-[var(--pulp-red)]/10 border border-[var(--pulp-red)]/30 rounded-lg">
                  <div className="text-[var(--pulp-red)] font-['var(--font-share-tech-mono)'] text-sm text-center">
                    ⚠ {error}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-[var(--pulp-orange)]/20 to-[var(--pulp-blue)]/20 
                         border-2 border-[var(--pulp-orange)]/30 rounded-lg text-[var(--pulp-orange)] 
                         font-['var(--font-share-tech-mono)'] font-medium text-lg
                         hover:border-[var(--pulp-orange)] hover:shadow-[0_0_20px_var(--pulp-orange),inset_0_0_15px_rgba(255,107,53,0.1)]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300 group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-[var(--pulp-orange)] border-t-transparent rounded-full animate-spin"></div>
                    <span>LAUNCHING...</span>
                  </div>
                ) : (
                  <span>LAUNCH INTO SPACE</span>
                )}
              </button>

              {/* Status Indicators */}
              <div className="flex justify-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--pulp-orange)] rounded-full animate-pulse"></div>
                  <span className="text-[var(--pulp-orange)] font-['var(--font-share-tech-mono)'] text-xs">
                    COSMIC LINK ACTIVE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--pulp-blue)] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-[var(--pulp-blue)] font-['var(--font-share-tech-mono)'] text-xs">
                    FUTURE-TECH SHIELD
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="text-muted-foreground font-['var(--font-share-tech-mono)'] text-xs">
              AI NEWS • COSMIC INTELLIGENCE NETWORK v2.0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
