import { Link } from 'react-router-dom'

interface Props {
  to: string
  label: string
  compact?: boolean
}

export function BackNav({ to, label, compact = false }: Props) {
  return (
    <nav
      className={`back-nav${compact ? ' back-nav--compact' : ''}`}
      aria-label="Volver a la pantalla anterior"
    >
      <Link to={to} className="back-nav__btn">
        <span className="back-nav__arrow" aria-hidden="true">
          ←
        </span>
        <span className="back-nav__text">
          <strong>Volver</strong>
          <small>{label}</small>
        </span>
      </Link>
    </nav>
  )
}
