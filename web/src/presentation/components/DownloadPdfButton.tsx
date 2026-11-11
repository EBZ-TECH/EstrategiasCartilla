import { useState } from 'react'
import { downloadLevelPdf } from '../../application/services/LevelPdfService'
import type { CognitiveLevel } from '../../domain/types'

interface Props {
  level: CognitiveLevel
}

export function DownloadPdfButton({ level }: Props) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const handleDownload = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    setStatus('Preparando la cartilla…')

    try {
      await downloadLevelPdf(level, setStatus)
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
    <div className="pdf-actions">
      <button
        type="button"
        className={`pdf-btn${busy ? ' is-busy' : ''}`}
        onClick={() => void handleDownload()}
        disabled={busy}
      >
        <span aria-hidden="true">📄</span>
        <span>{busy ? 'Generando PDF…' : 'Descargar en PDF'}</span>
      </button>
      {status ? <p className="pdf-actions__status">{status}</p> : null}
      {error ? <p className="pdf-actions__error">{error}</p> : null}
    </div>
  )
}
