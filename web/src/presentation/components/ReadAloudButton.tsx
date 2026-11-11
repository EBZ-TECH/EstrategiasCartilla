import { useSpeech } from '../hooks/useSpeech'

interface Props {
  text: string
  label?: string
  stopLabel?: string
  size?: 'md' | 'lg'
  className?: string
}

export function ReadAloudButton({
  text,
  label = 'Escuchar',
  stopLabel = 'Detener',
  size = 'md',
  className = '',
}: Props) {
  const { supported, speaking, currentText, toggle } = useSpeech()
  const active = speaking && currentText === text.trim()

  if (!supported) return null

  return (
    <button
      type="button"
      className={`read-btn read-btn--${size} ${active ? 'is-speaking' : ''} ${className}`.trim()}
      onClick={() => toggle(text)}
      aria-pressed={active}
    >
      <span className="read-btn__icon" aria-hidden="true">
        {active ? '⏹' : '🔊'}
      </span>
      <span>{active ? stopLabel : label}</span>
    </button>
  )
}
