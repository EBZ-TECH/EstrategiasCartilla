import { useParams } from 'react-router-dom'
import { useLevel, useOccupation } from './useCartilla'

export function useStickyBack(): { to: string; label: string } | null {
  const { levelId, occupationId, activityId } = useParams()
  const level = useLevel(levelId)
  const occupation = useOccupation(levelId, occupationId)

  if (activityId && level && occupation) {
    return {
      to: `/nivel/${level.id}/${occupation.id}`,
      label: `Volver a ${occupation.shortTitle}`,
    }
  }

  if (occupationId && level) {
    return {
      to: `/nivel/${level.id}`,
      label: `Volver a ${level.shortTitle}`,
    }
  }

  if (levelId) {
    return {
      to: '/',
      label: 'Ir al inicio',
    }
  }

  return null
}
