import { useEffect, useState } from 'react'

type Size = 'md' | 'lg' | 'xl'

const STORAGE_KEY = 'cartilla-font-size'

export function FontControls() {
  const [size, setSize] = useState<Size>('xl')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Size | null
    if (saved === 'md' || saved === 'lg' || saved === 'xl') {
      setSize(saved)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.fontSize = size
    localStorage.setItem(STORAGE_KEY, size)
  }, [size])

  return (
    <div className="font-controls" role="group" aria-label="Tamaño de letra">
      <button
        type="button"
        className={size === 'md' ? 'is-active' : undefined}
        onClick={() => setSize('md')}
        aria-pressed={size === 'md'}
      >
        A
      </button>
      <button
        type="button"
        className={size === 'lg' ? 'is-active' : undefined}
        onClick={() => setSize('lg')}
        aria-pressed={size === 'lg'}
      >
        A+
      </button>
      <button
        type="button"
        className={size === 'xl' ? 'is-active' : undefined}
        onClick={() => setSize('xl')}
        aria-pressed={size === 'xl'}
      >
        A++
      </button>
    </div>
  )
}
