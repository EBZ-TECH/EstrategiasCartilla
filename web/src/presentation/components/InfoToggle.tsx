import { useId, useState, type ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function InfoToggle({ title, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <div className={`info-toggle${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="info-toggle__btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{open ? 'Ocultar explicación' : title}</span>
        <span aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>
      {open ? (
        <div id={panelId} className="info-toggle__panel">
          {children}
        </div>
      ) : null}
    </div>
  )
}
