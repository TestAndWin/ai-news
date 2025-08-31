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

    // Captain Future cosmic characters (space symbols, numbers, sci-fi glyphs)
    const chars = '★☆✦✧◆◇◈◉●○◐◑◒◓☄☽☾♦♧♠♣∆∇▲▼◄►▪▫□■△▽◊※⋆✱✲✳⊕⊗⊙⍟⌘⌬⌭⌯⌰⌱⌲⌳⌴⌵⌶⌷⌸⌹⌺⌻⌼⌽⌾⌿⍀⍁⍂⍃⍄⍅⍆⍇⍈⍉⍊⍋⍌⍍⍎0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const charArray = chars.split('')

    const fontSize = 14
    const columns = canvas.width / fontSize

    // Array of drops - one per column
    const drops: number[] = []
    for (let x = 0; x < columns; x++) {
      drops[x] = 1
    }

    const draw = () => {
      // Dark space background with slight transparency for trail effect
      ctx.fillStyle = 'rgba(15, 20, 25, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#ff6b35' // Captain Future orange
      ctx.font = `${fontSize}px monospace`

      // Loop over drops
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = charArray[Math.floor(Math.random() * charArray.length)]
        
        // Draw character with cosmic colors
        const colors = [
          `rgba(255, 107, 53, ${Math.random() * 0.6 + 0.4})`,  // Orange
          `rgba(0, 212, 255, ${Math.random() * 0.4 + 0.3})`,    // Blue
          `rgba(255, 215, 0, ${Math.random() * 0.3 + 0.2})`     // Yellow
        ]
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        // Sending the drop back to the top randomly after it has crossed the screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        
        // Increment Y coordinate
        drops[i]++
      }
    }

    // Start animation (slower for cosmic effect)
    const interval = setInterval(draw, 50)

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