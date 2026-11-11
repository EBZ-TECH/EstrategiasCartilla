import { Link } from 'react-router-dom'

export interface Crumb {
  label: string
  to?: string
}

interface Props {
  items: Crumb[]
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav className="breadcrumbs" aria-label="Usted está aquí">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
