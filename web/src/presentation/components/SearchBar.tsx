import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSearch } from '../hooks/useCartilla'

export function SearchBar() {
  const inputId = useId()
  const [query, setQuery] = useState('')
  const results = useSearch(query)

  return (
    <div className="search">
      <label className="search__label" htmlFor={inputId}>
        Buscar una actividad o consejo
      </label>
      <input
        id={inputId}
        className="search__input"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Ejemplo: baño, medicamentos, sueño..."
        autoComplete="off"
      />

      {query.trim().length >= 2 && (
        <div className="search__results" role="listbox" aria-label="Resultados de búsqueda">
          {results.length === 0 ? (
            <p className="search__empty">No encontramos coincidencias. Pruebe otra palabra.</p>
          ) : (
            <ul>
              {results.map((item) => (
                <li key={`${item.levelId}-${item.occupationId}-${item.activityId}`}>
                  <Link
                    to={`/nivel/${item.levelId}/${item.occupationId}/${item.activityId}`}
                    onClick={() => setQuery('')}
                  >
                    <strong>{item.activityTitle}</strong>
                    <span>
                      {item.levelTitle} · {item.occupationTitle}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
