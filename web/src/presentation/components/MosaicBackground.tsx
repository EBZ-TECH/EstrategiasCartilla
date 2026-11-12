import { useEffect, useRef } from 'react'

interface Props {
  primary?: string
  accent?: string
  className?: string
}

/** Mosaico denso tipo EVS, con iconos de cuidado y ocupaciones. */
const ICONS = [
  '🧠',
  '🛁',
  '👕',
  '🍽️',
  '💊',
  '🛏️',
  '🚶',
  '🏠',
  '❤️',
  '🧼',
  '👓',
  '🤝',
  '🌿',
  '☀️',
  '🛒',
  '📞',
  '🧸',
  '🧶',
  '🧴',
  '🎵',
  '☕',
  '📚',
  '🩺',
  '⏰',
]

export function MosaicBackground({
  primary = '#1C5AA6',
  accent = '#F2A012',
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0

    const paint = () => {
      const parent = canvas.parentElement
      const width = parent?.clientWidth || window.innerWidth
      const height = Math.max(parent?.clientHeight || window.innerHeight, window.innerHeight)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      paintLayer(ctx, width, height, {
        stepX: 52,
        stepY: 56,
        fontSize: 22,
        baseAlpha: 0.12,
        goldEvery: 8,
        skipA: 19,
        skipB: 29,
        oddOffset: 0.42,
        primary,
        accent,
        seedSalt: 0,
      })

      paintLayer(ctx, width, height, {
        stepX: 38,
        stepY: 42,
        fontSize: 14,
        baseAlpha: 0.07,
        goldEvery: 7,
        skipA: 13,
        skipB: 17,
        oddOffset: 0.55,
        primary,
        accent,
        seedSalt: 41,
      })
    }

    const onResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(paint)
    }

    paint()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(frame)
    }
  }, [primary, accent])

  return (
    <canvas
      ref={canvasRef}
      className={`mosaic-bg ${className}`.trim()}
      aria-hidden="true"
    />
  )
}

function paintLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: {
    stepX: number
    stepY: number
    fontSize: number
    baseAlpha: number
    goldEvery: number
    skipA: number
    skipB: number
    oddOffset: number
    primary: string
    accent: string
    seedSalt: number
  },
) {
  const cols = Math.ceil(width / opts.stepX) + 3
  const rows = Math.ceil(height / opts.stepY) + 3

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const seed = row * 97 + col * 53 + opts.seedSalt
      if (seed % opts.skipA === 0 || seed % opts.skipB === 0) continue

      const icon = ICONS[seed % ICONS.length]
      const dx = col * opts.stepX + (row % 2 === 1 ? opts.stepX * opts.oddOffset : 0) - 10
      const dy = row * opts.stepY - 8 + ((seed % 7) - 3) * 1.6
      const angle = ((seed % 11) - 5) * 0.06
      const scale = 0.88 + (seed % 5) * 0.05
      const alpha = opts.baseAlpha + (seed % 4) * 0.015
      const useAccent = seed % opts.goldEvery === 0

      ctx.save()
      ctx.translate(dx + opts.fontSize * 0.7, dy + opts.fontSize * 0.7)
      ctx.rotate(angle)
      ctx.scale(scale, scale)
      ctx.globalAlpha = alpha
      ctx.font = `${opts.fontSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      // Sombra de color temático detrás del emoji para amarrar la textura al nivel
      ctx.fillStyle = useAccent ? opts.accent : opts.primary
      ctx.beginPath()
      ctx.arc(0, 0, opts.fontSize * 0.55, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = Math.min(0.55, alpha + 0.25)
      ctx.fillText(icon, 0, 0)
      ctx.restore()
    }
  }
}
