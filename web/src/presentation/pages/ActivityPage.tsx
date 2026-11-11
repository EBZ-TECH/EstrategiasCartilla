import { Link, useParams } from 'react-router-dom'
import { splitStrategyTitle } from '../../data/activityImages'
import { ActivityPhoto, StrategyPhoto } from '../components/ActivityPhoto'
import { ReadAloudButton } from '../components/ReadAloudButton'
import { useActivity, useLevel, useOccupation } from '../hooks/useCartilla'
import { useSpeech } from '../hooks/useSpeech'
import { NotFoundPage } from './NotFoundPage'

export function ActivityPage() {
  const { levelId, occupationId, activityId } = useParams()
  const level = useLevel(levelId)
  const occupation = useOccupation(levelId, occupationId)
  const activity = useActivity(levelId, occupationId, activityId)
  useSpeech({ stopOnUnmount: true })

  if (!level || !occupation || !activity) return <NotFoundPage />

  const index = occupation.activities.findIndex((item) => item.id === activity.id)
  const previous = index > 0 ? occupation.activities[index - 1] : undefined
  const next =
    index >= 0 && index < occupation.activities.length - 1
      ? occupation.activities[index + 1]
      : undefined

  const allText = [
    activity.title,
    ...activity.strategies.map(
      (strategy, strategyIndex) => `Consejo ${strategyIndex + 1}. ${strategy}`,
    ),
  ].join('. ')

  return (
    <div className="page page--mobile-first">
      <header className="screen-head screen-head--photo" style={{ ['--level-color' as string]: level.color }}>
        <ActivityPhoto
          activityId={activity.id}
          alt={`Imagen de ${activity.title}`}
          className="activity-photo--hero"
        />
        <div className="screen-head__text">
          <p className="screen-head__badge">
            Actividad {index + 1} de {occupation.activities.length}
          </p>
          <h1>
            {index + 1}. {activity.title}
          </h1>
          <ReadAloudButton text={allText} label="Escuchar esta página" size="lg" />
        </div>
      </header>

      <ol className="strategy-list">
        {activity.strategies.map((strategy, strategyIndex) => {
          const { title, body } = splitStrategyTitle(strategy)
          const heading = title
            ? `${strategyIndex + 1}. ${title}`
            : `${strategyIndex + 1}. Consejo`

          return (
            <li
              key={`${activity.id}-${strategyIndex}`}
              className="strategy-card strategy-card--photo"
            >
              <StrategyPhoto
                activityId={activity.id}
                strategyText={strategy}
                alt={`Imagen del consejo ${strategyIndex + 1}`}
                className="activity-photo--strategy"
              />
              <div className="strategy-card__content">
                <div className="strategy-card__top">
                  <h2 className="strategy-card__title">{heading}</h2>
                  <ReadAloudButton
                    text={`Consejo ${strategyIndex + 1}. ${strategy}`}
                    label="Escuchar"
                    stopLabel="Detener"
                  />
                </div>
                <p>{body || strategy}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <nav className="pager" aria-label="Otras actividades">
        {previous ? (
          <Link
            className="btn btn--secondary"
            to={`/nivel/${level.id}/${occupation.id}/${previous.id}`}
          >
            ← Anterior
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            className="btn btn--primary"
            to={`/nivel/${level.id}/${occupation.id}/${next.id}`}
          >
            Siguiente →
          </Link>
        ) : (
          <Link className="btn btn--primary" to={`/nivel/${level.id}/${occupation.id}`}>
            ← Volver a la lista
          </Link>
        )}
      </nav>
    </div>
  )
}
