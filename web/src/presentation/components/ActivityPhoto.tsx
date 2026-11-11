import { getActivityImage, getStrategyImage } from '../../data/activityImages'

interface ActivityPhotoProps {
  activityId: string
  alt: string
  className?: string
}

export function ActivityPhoto({ activityId, alt, className = '' }: ActivityPhotoProps) {
  return (
    <img
      className={`activity-photo ${className}`.trim()}
      src={getActivityImage(activityId)}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  )
}

interface StrategyPhotoProps {
  activityId: string
  strategyText: string
  alt: string
  className?: string
}

export function StrategyPhoto({
  activityId,
  strategyText,
  alt,
  className = '',
}: StrategyPhotoProps) {
  return (
    <img
      className={`activity-photo ${className}`.trim()}
      src={getStrategyImage(strategyText, activityId)}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  )
}
