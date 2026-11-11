import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page not-found">
      <h1>No encontramos esta página</h1>
      <p>Es posible que el enlace esté incompleto. Regrese al inicio y elija de nuevo.</p>
      <Link className="btn btn--primary" to="/">
        Ir al inicio
      </Link>
    </div>
  )
}
