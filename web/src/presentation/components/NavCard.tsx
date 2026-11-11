import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface Props {
  to: string
  title: string
  subtitle: string
  tone?: string
  icon?: ReactNode
  image?: ReactNode
}

export function NavCard({ to, title, subtitle, tone, icon, image }: Props) {
  return (
    <Link
      to={to}
      className={`nav-card${image ? ' nav-card--media' : ''}`}
      style={tone ? { ['--card-tone' as string]: tone } : undefined}
    >
      {image ? <span className="nav-card__media">{image}</span> : null}
      <span className="nav-card__row">
        {!image && icon ? (
          <span className="nav-card__well" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="nav-card__copy">
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>
        <span className="nav-card__chevron" aria-hidden="true">
          ›
        </span>
      </span>
    </Link>
  )
}
