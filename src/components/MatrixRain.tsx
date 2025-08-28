'use client'

import { useEffect, useRef } from 'react'

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Matrix characters (Japanese katakana, numbers, symbols)
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?'
    const charArray = chars.split('')

    const fontSize = 14
    const columns = canvas.width / fontSize

    // Array of drops - one per column
    const drops: number[] = []
    for (let x = 0; x < columns; x++) {
      drops[x] = 1
    }

    const draw = () => {
      // Black background with slight transparency for trail effect
      ctx.fillStyle = 'rgba(10, 10, 15, 0.04)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#00ff88' // Neon green
      ctx.font = `${fontSize}px monospace`

      // Loop over drops
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = charArray[Math.floor(Math.random() * charArray.length)]
        
        // Draw character
        ctx.fillStyle = `rgba(0, 255, 136, ${Math.random() * 0.5 + 0.5})`
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        // Sending the drop back to the top randomly after it has crossed the screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        
        // Increment Y coordinate
        drops[i]++
      }
    }

    // Start animation
    const interval = setInterval(draw, 35)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-20"
      style={{ background: 'transparent' }}
    />
  )
}