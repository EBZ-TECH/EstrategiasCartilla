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

const CLOSE_MS = 320

export function UsageManual({
  open: controlledOpen,
  onOpenChange,
  autoOpenOnce = false,
  triggerLabel = 'Manual de uso',
}: Props) {
  const titleId = useId()
  const { usageManual } = siteInfo
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const closeTimer = useRef<number | null>(null)
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

    if (open) {
      setMounted(true)
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setVisible(true))
      })
      document.body.style.overflow = 'hidden'
      return () => window.cancelAnimationFrame(id)
    }

    setVisible(false)
    document.body.style.overflow = ''
    closeTimer.current = window.setTimeout(() => {
      setMounted(false)
      closeTimer.current = null
    }, CLOSE_MS)

    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
      document.body.style.overflow = ''
    }
  }, [open])

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
          <div className="manual-panel">
            <div className="manual-panel__grab" aria-hidden="true" />

            <header className="manual-panel__head">
              <div className="manual-panel__title-row">
                <div>
                  <p className="screen-head__badge">Ayuda</p>
                  <h2 id={titleId}>{usageManual.title}</h2>
                </div>
                <button
                  type="button"
                  className="manual-close"
                  aria-label="Cerrar manual"
                  onClick={markSeenAndClose}
                >
                  ×
                </button>
              </div>
              <p className="manual-panel__lead">
                Pasos simples para usar la cartilla. También puede escucharlos.
              </p>
              <ReadAloudButton text={speechText} label="Escuchar el manual" size="lg" />
            </header>

            <ol className="manual-steps">
              {usageManual.steps.map((step, index) => (
                <li key={step.title} className="manual-step">
                  <span className="manual-step__num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="manual-step__copy">
                    <h3>{step.title.replace(/^\d+\.\s*/, '')}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="manual-panel__actions">
              <button type="button" className="btn btn--primary" onClick={markSeenAndClose}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
