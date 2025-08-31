'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MatrixRain } from '@/components/MatrixRain'
import { api } from '@/lib/api-client'
import { Lock, Eye, EyeOff, Terminal } from 'lucide-react'

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
        setError('ACCESS DENIED - INVALID CREDENTIALS')
      }
    } catch (error) {
      setError('SYSTEM ERROR - CONNECTION FAILED')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MatrixRain />
      
      <div className="flex items-center justify-center min-h-screen relative z-10 px-4">
        <div className="w-full max-w-md">
          {/* Terminal Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Terminal className="w-8 h-8 text-[#00ff88]" />
              <div className="text-4xl font-bold text-[#00ff88] glitch-effect font-['var(--font-orbitron)']" 
                   style={{textShadow: '0 0 20px #00ff88, 0 0 40px #00ff88'}}>
                SECURE ACCESS
              </div>
            </div>
            <div className="text-[#00f5ff] font-['var(--font-share-tech-mono)'] text-sm">
              <span className="typing-effect">AUTHORIZATION REQUIRED • NEURAL NETWORK PROTECTED</span>
            </div>
          </div>

          {/* Login Form */}
          <div className="border-2 border-[#00ff88]/30 rounded-lg bg-card/20 backdrop-blur-md p-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 via-transparent to-[#00f5ff]/5 rounded-lg"></div>
            
            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-[#00ff88] font-['var(--font-share-tech-mono)'] text-sm font-medium">
                  ACCESS CODE
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#00f5ff]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-black/40 border-2 border-[#00f5ff]/30 rounded-lg 
                             text-[#00ff88] placeholder-[#00f5ff]/50 font-['var(--font-share-tech-mono)']
                             focus:border-[#00f5ff] focus:ring-0 focus:outline-none
                             hover:border-[#00f5ff]/60 transition-colors"
                    placeholder="Enter secure access code..."
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00f5ff] 
                             hover:text-[#00ff88] transition-colors"
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
                <div className="p-3 bg-[#ff0080]/10 border border-[#ff0080]/30 rounded-lg">
                  <div className="text-[#ff0080] font-['var(--font-share-tech-mono)'] text-sm text-center">
                    ⚠ {error}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#00ff88]/20 to-[#00f5ff]/20 
                         border-2 border-[#00ff88]/30 rounded-lg text-[#00ff88] 
                         font-['var(--font-share-tech-mono)'] font-medium text-lg
                         hover:border-[#00ff88] hover:shadow-[0_0_20px_#00ff88,inset_0_0_15px_rgba(0,255,136,0.1)]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300 group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                    <span>AUTHENTICATING...</span>
                  </div>
                ) : (
                  <span>INITIALIZE ACCESS</span>
                )}
              </button>

              {/* Status Indicators */}
              <div className="flex justify-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
                  <span className="text-[#00ff88] font-['var(--font-share-tech-mono)'] text-xs">
                    SECURE CONNECTION
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00f5ff] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-[#00f5ff] font-['var(--font-share-tech-mono)'] text-xs">
                    QUANTUM ENCRYPTED
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="text-muted-foreground font-['var(--font-share-tech-mono)'] text-xs">
              AI NEWS TERMINAL v2.0 • NEURAL AUTHENTICATION SYSTEM
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}