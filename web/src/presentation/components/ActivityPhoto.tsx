import { getActivityImage, getStrategyImage } from '../../data/activityImages'

interface ActivityPhotoProps {
  activityId: string
  levelId?: string
  occupationId?: string
  alt: string
  className?: string
}

export function ActivityPhoto({
  activityId,
  levelId,
  occupationId,
  alt,
  className = '',
}: ActivityPhotoProps) {
  return (
    <img
      className={`activity-photo ${className}`.trim()}
      src={getActivityImage(activityId, levelId, occupationId)}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  )
}

interface StrategyPhotoProps {
  activityId: string
  levelId?: string
  occupationId?: string
  strategyText: string
  alt: string
  className?: string
}

export function StrategyPhoto({
  activityId,
  levelId,
  occupationId,
  strategyText,
  alt,
  className = '',
}: StrategyPhotoProps) {
  return (
    <img
      className={`activity-photo ${className}`.trim()}
      src={getStrategyImage(strategyText, activityId, levelId, occupationId)}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  )
}
