import { useState } from 'react'
import {
  downloadAllLevelsPdf,
  downloadLevelPdf,
} from '../../application/services/LevelPdfService'
import type { CognitiveLevel } from '../../domain/types'

interface LevelProps {
  mode?: 'level'
  level: CognitiveLevel
  label?: string
  className?: string
}

interface AllProps {
  mode: 'all'
  levels: CognitiveLevel[]
  label?: string
  className?: string
}

type Props = LevelProps | AllProps

export function DownloadPdfButton(props: Props) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const isAll = props.mode === 'all'
  const label =
    props.label ??
    (isAll ? 'Descargar cartilla completa (PDF)' : 'Descargar en PDF')

  const handleDownload = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    setStatus(isAll ? 'Preparando la cartilla completa…' : 'Preparando la cartilla…')

    try {
      if (isAll) {
        await downloadAllLevelsPdf(props.levels, setStatus)
      } else {
        await downloadLevelPdf(props.level, setStatus)
      }
      setStatus('PDF descargado')
      window.setTimeout(() => setStatus(''), 2500)
    } catch {
      setError('No se pudo crear el PDF. Revise su conexión e intente de nuevo.')
      setStatus('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`pdf-actions${props.className ? ` ${props.className}` : ''}`}>
      <button
        type="button"
        className={`pdf-btn${isAll ? ' pdf-btn--all' : ''}${busy ? ' is-busy' : ''}`}
        onClick={() => void handleDownload()}
        disabled={busy}
      >
        <span aria-hidden="true">📄</span>
        <span>{busy ? 'Generando PDF…' : label}</span>
      </button>
      {status ? <p className="pdf-actions__status">{status}</p> : null}
      {error ? <p className="pdf-actions__error">{error}</p> : null}
    </div>
  )
}
