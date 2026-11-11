import type { OccupationIcon as IconName } from '../../domain/types'

interface Props {
  name: IconName
  className?: string
}

export function OccupationIcon({ name, className = 'icon' }: Props) {
  switch (name) {
    case 'home':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3.2 3.5 10v10.5h5.7V14h5.6v6.5h5.7V10L12 3.2Z"
          />
        </svg>
      )
    case 'list':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 6h2v2H4V6Zm4 0h12v2H8V6ZM4 11h2v2H4v-2Zm4 0h12v2H8v-2ZM4 16h2v2H4v-2Zm4 0h12v2H8v-2Z"
          />
        </svg>
      )
    case 'heart':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 20.4 10.6 19.1C5.4 14.4 2 11.3 2 7.5 2 4.4 4.4 2 7.5 2c1.7 0 3.4.8 4.5 2.1C13.1 2.8 14.8 2 16.5 2 19.6 2 22 4.4 22 7.5c0 3.8-3.4 6.9-8.6 11.6L12 20.4Z"
          />
        </svg>
      )
    case 'moon':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12.2 2a9.8 9.8 0 0 0-1 .05A9 9 0 1 0 20.9 14a8 8 0 0 1-8.7-12Z"
          />
        </svg>
      )
    case 'briefcase':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M10 3h4a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v3H2V8a2 2 0 0 1 2-2h4V5a2 2 0 0 1 2-2Zm0 3h4V5h-4v1Zm12 6v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6h7v1h6v-1h7Z"
          />
        </svg>
      )
    case 'sparkles':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="m12 2 1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2Zm7 9 .9 2.9L23 15l-3.1.9L19 19l-.9-3.1L15 15l3.1-.9L19 11ZM5 13l.8 2.5L8.5 16 5.8 16.8 5 19.5l-.8-2.7L1.5 16l2.7-.5L5 13Z"
          />
        </svg>
      )
    case 'users':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 8a6 6 0 0 1 12 0H4Zm13-9a3.5 3.5 0 1 0-3.4-4.2A5.5 5.5 0 0 1 16 12c1.5 0 2.9.4 4.1 1.1A4.9 4.9 0 0 0 17 11Z"
          />
        </svg>
      )
    default:
      return null
  }
}
