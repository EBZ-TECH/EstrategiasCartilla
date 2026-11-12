import { useEffect, useId, useRef, useState } from 'react'
import { getUsageManualSpeechText, siteInfo } from '../../domain/siteInfo'
import { useSpeech } from '../hooks/useSpeech'
import { ReadAloudButton } from './ReadAloudButton'

interface Props {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  autoOpenOnce?: boolean
  triggerLabel?: string
}

const CLOSE_MS = 380

function lockBodyScroll() {
  const scrollY = window.scrollY
  const body = document.body
  body.dataset.manualScrollY = String(scrollY)
  body.style.position = 'fixed'
  body.style.top = `-${scrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
  body.style.overflow = 'hidden'
}

function unlockBodyScroll() {
  const body = document.body
  const scrollY = Number(body.dataset.manualScrollY || '0')
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.overflow = ''
  delete body.dataset.manualScrollY
  window.scrollTo(0, scrollY)
}

export function UsageManual({
  open: controlledOpen,
  onOpenChange,
  autoOpenOnce = false,
  triggerLabel = 'Manual de uso',
}: Props) {
  const titleId = useId()
  const { brand, usageManual } = siteInfo
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const { stop } = useSpeech()

  const setOpen = (next: boolean) => {
    onOpenChange?.(next)
    if (controlledOpen === undefined) setInternalOpen(next)
    if (!next) stop()
  }

  useEffect(() => {
    if (!autoOpenOnce) return
    try {
      const seen = window.localStorage.getItem(usageManual.storageKey)
      if (!seen) setOpen(true)
    } catch {
      setOpen(true)
    }
  }, [autoOpenOnce, usageManual.storageKey])

  useEffect(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }

    const resetScroll = () => {
      const el = scrollRef.current
      if (!el) return
      el.scrollTop = 0
    }

    if (open) {
      setMounted(true)
      lockBodyScroll()
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setVisible(true)
          resetScroll()
          // Reintentos: en móvil el layout termina después del primer paint
          window.setTimeout(resetScroll, 50)
          window.setTimeout(resetScroll, 180)
          window.setTimeout(() => {
            resetScroll()
            titleRef.current?.focus({ preventScroll: true })
          }, 320)
        })
      })
      return () => window.cancelAnimationFrame(id)
    }

    setVisible(false)
    closeTimer.current = window.setTimeout(() => {
      setMounted(false)
      unlockBodyScroll()
      closeTimer.current = null
    }, CLOSE_MS)

    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    }
  }, [open])

  useEffect(() => {
    return () => {
      // Si el componente se desmonta con el manual abierto
      if (document.body.style.position === 'fixed') unlockBodyScroll()
    }
  }, [])

  const markSeenAndClose = () => {
    try {
      window.localStorage.setItem(usageManual.storageKey, '1')
    } catch {
      // ignore
    }
    setOpen(false)
  }

  const speechText = getUsageManualSpeechText()

  return (
    <>
      <button type="button" className="btn btn--secondary" onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>

      {mounted ? (
        <div
          className={`manual-overlay${visible ? ' is-open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => {
            if (event.target === event.currentTarget) markSeenAndClose()
          }}
        >
          <div
            className="manual-card"
            onTouchStart={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="manual-card__close"
              aria-label="Cerrar manual"
              onClick={markSeenAndClose}
            >
              ×
            </button>

            <div
              className="manual-card__scroll"
              ref={scrollRef}
              tabIndex={-1}
            >
              <div className="manual-card__hero">
                <img
                  className="manual-card__logo"
                  src={brand.logoSrc}
                  alt=""
                  width={96}
                  height={96}
                />
                <p className="manual-card__kicker">Bienvenida a la cartilla</p>
                <h2
                  id={titleId}
                  className="manual-card__title"
                  ref={titleRef}
                  tabIndex={-1}
                >
                  {usageManual.title}
                </h2>
                <p className="manual-card__lead">
                  Siga estos 7 pasos. Puede escucharlos si lo prefiere.
                </p>
                <div className="manual-card__listen">
                  <ReadAloudButton text={speechText} label="Escuchar el manual" size="lg" />
                </div>
              </div>

              <ol className="manual-timeline">
                {usageManual.steps.map((step, index) => (
                  <li key={step.title} className="manual-timeline__item">
                    <span className="manual-timeline__rail" aria-hidden="true">
                      <span className="manual-timeline__dot">{index + 1}</span>
                    </span>
                    <div className="manual-timeline__body">
                      <h3>{step.title.replace(/^\d+\.\s*/, '')}</h3>
                      <p>{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="manual-card__footer">
              <button
                type="button"
                className="btn btn--primary manual-card__cta"
                onClick={markSeenAndClose}
              >
                Empezar ahora
              </button>
              <p className="manual-card__footnote">
                Podrá abrir este manual otra vez desde el inicio.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
