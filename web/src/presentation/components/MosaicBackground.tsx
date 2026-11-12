import { useEffect, useRef } from 'react'

interface Props {
  primary?: string
  accent?: string
  className?: string
}

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

/** Mosaico con fundido suave al cambiar de nivel. */
export function MosaicBackground({
  primary = '#1F8A70',
  accent = '#F2C94C',
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colorsRef = useRef({ primary, accent })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    let resizeFrame = 0

    const paint = () => {
      if (cancelled) return
      paintCanvas(canvas, colorsRef.current.primary, colorsRef.current.accent)
    }

    const onResize = () => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(paint)
    }

    // Primera pintura
    colorsRef.current = { primary, accent }
    paint()
    canvas.classList.add('is-visible')

    window.addEventListener('resize', onResize)
    return () => {
      cancelled = true
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(resizeFrame)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (
      colorsRef.current.primary === primary &&
      colorsRef.current.accent === accent
    ) {
      return
    }

    canvas.classList.remove('is-visible')
    const timer = window.setTimeout(() => {
      colorsRef.current = { primary, accent }
      paintCanvas(canvas, primary, accent)
      requestAnimationFrame(() => canvas.classList.add('is-visible'))
    }, 180)

    return () => window.clearTimeout(timer)
  }, [primary, accent])

  return (
    <div className={`mosaic-stack ${className}`.trim()} aria-hidden="true">
      <canvas ref={canvasRef} className="mosaic-bg mosaic-bg--front" />
    </div>
  )
}

function paintCanvas(canvas: HTMLCanvasElement, primary: string, accent: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = window.innerWidth
  const height = Math.max(window.innerHeight, document.documentElement.scrollHeight || 0)
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
    baseAlpha: 0.11,
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
    baseAlpha: 0.06,
    goldEvery: 7,
    skipA: 13,
    skipB: 17,
    oddOffset: 0.55,
    primary,
    accent,
    seedSalt: 41,
  })
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
      ctx.fillStyle = useAccent ? opts.accent : opts.primary
      ctx.beginPath()
      ctx.arc(0, 0, opts.fontSize * 0.55, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = Math.min(0.5, alpha + 0.22)
      ctx.fillText(icon, 0, 0)
      ctx.restore()
    }
  }
}
