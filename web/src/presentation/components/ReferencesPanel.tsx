import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { siteInfo } from '../../domain/siteInfo'

interface Props {
  triggerLabel?: string
  triggerClassName?: string
}

const CLOSE_MS = 380

export function ReferencesPanel({
  triggerLabel = 'Referencias bibliográficas',
  triggerClassName = 'btn btn--secondary',
}: Props) {
  const titleId = useId()
  const { brand, references } = siteInfo
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }

    if (open) {
      setMounted(true)
      document.documentElement.classList.add('manual-open')
      document.body.classList.add('manual-open')
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setVisible(true)
          if (scrollRef.current) scrollRef.current.scrollTop = 0
        })
      })
      return () => window.cancelAnimationFrame(id)
    }

    setVisible(false)
    closeTimer.current = window.setTimeout(() => {
      setMounted(false)
      document.documentElement.classList.remove('manual-open')
      document.body.classList.remove('manual-open')
      closeTimer.current = null
    }, CLOSE_MS)

    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    }
  }, [open])

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('manual-open')
      document.body.classList.remove('manual-open')
    }
  }, [])

  const dialog =
    mounted && typeof document !== 'undefined' ? (
      <div
        className={`manual-overlay${visible ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false)
        }}
      >
        <div className="manual-card references-card">
          <button
            type="button"
            className="manual-card__close"
            aria-label="Cerrar referencias"
            onClick={() => setOpen(false)}
          >
            ×
          </button>

          <div className="manual-card__scroll" ref={scrollRef}>
            <div className="manual-card__hero">
              <img
                className="manual-card__logo"
                src={brand.logoSrc}
                alt=""
                width={96}
                height={96}
              />
              <p className="manual-card__kicker">Sustento académico</p>
              <h2 id={titleId} className="manual-card__title">
                {references.title}
              </h2>
              <p className="manual-card__lead">{references.lead}</p>
            </div>

            <ol className="references-list">
              {references.items.map((item, index) => (
                <li key={item.id} className="references-list__item">
                  <span className="references-list__index" aria-hidden="true">
                    {index + 1}.
                  </span>
                  <div className="references-list__body">
                    <p>{item.text}</p>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="references-list__link"
                      >
                        Disponible en: {item.url}
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="manual-card__footer">
            <button
              type="button"
              className="btn btn--primary manual-card__cta"
              onClick={() => setOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    ) : null

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>
      {dialog ? createPortal(dialog, document.body) : null}
    </>
  )
}
