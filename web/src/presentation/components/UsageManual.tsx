import { useEffect, useId, useState } from 'react'
import { getUsageManualSpeechText, siteInfo } from '../../domain/siteInfo'
import { useSpeech } from '../hooks/useSpeech'
import { ReadAloudButton } from './ReadAloudButton'

interface Props {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Si true, abre solo la primera vez. */
  autoOpenOnce?: boolean
  triggerLabel?: string
}

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

      {open ? (
        <div
          className="manual-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => {
            if (event.target === event.currentTarget) markSeenAndClose()
          }}
        >
          <div className="manual-panel">
            <header className="manual-panel__head">
              <p className="screen-head__badge">Ayuda</p>
              <h2 id={titleId}>{usageManual.title}</h2>
              <p className="manual-panel__lead">
                Pasos simples para usar la cartilla. También puede escucharlos.
              </p>
              <ReadAloudButton text={speechText} label="Escuchar el manual" size="lg" />
            </header>

            <ol className="manual-steps">
              {usageManual.steps.map((step) => (
                <li key={step.title} className="manual-step">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
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
