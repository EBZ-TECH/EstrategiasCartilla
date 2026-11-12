import { useParams } from 'react-router-dom'
import { ActivityPhoto } from '../components/ActivityPhoto'
import { NavCard } from '../components/NavCard'
import { ReadAloudButton } from '../components/ReadAloudButton'
import { useLevel, useOccupation } from '../hooks/useCartilla'
import { useSpeech } from '../hooks/useSpeech'
import { NotFoundPage } from './NotFoundPage'

export function OccupationPage() {
  const { levelId, occupationId } = useParams()
  const level = useLevel(levelId)
  const occupation = useOccupation(levelId, occupationId)
  useSpeech({ stopOnUnmount: true })

  if (!level || !occupation) return <NotFoundPage />

  const listenText = [
    `Está en el nivel ${level.shortTitle}.`,
    `Área: ${occupation.title}.`,
    `Hay ${occupation.activities.length} actividades.`,
    ...occupation.activities.map((activity, index) => {
      return `Actividad ${index + 1}: ${activity.title}. Tiene ${activity.strategies.length} consejos.`
    }),
    'Toque una actividad para ver los consejos.',
  ].join(' ')

  return (
    <div className="page page--mobile-first">
      <header className="screen-head" style={{ ['--level-color' as string]: level.color }}>
        <p className="screen-head__badge">{level.shortTitle}</p>
        <h1>{occupation.shortTitle}</h1>
        <p className="screen-head__hint">Toque una actividad</p>
        <ReadAloudButton text={listenText} label="Escuchar esta página" size="lg" />
      </header>

      <section className="section section--priority" aria-labelledby="actividades-title">
        <div className="section__head section__head--compact">
          <h2 id="actividades-title">Actividades</h2>
          <p>{occupation.activities.length} temas</p>
        </div>

        <div className="nav-card-list">
          {occupation.activities.map((activity, index) => (
            <NavCard
              key={activity.id}
              to={`/nivel/${level.id}/${occupation.id}/${activity.id}`}
              title={`${index + 1}. ${activity.title}`}
              subtitle={`${activity.strategies.length} consejos · tocar para abrir`}
              tone={level.color}
              image={
                <ActivityPhoto
                  activityId={activity.id}
                  levelId={level.id}
                  occupationId={occupation.id}
                  alt={`Imagen de ${activity.title}`}
                  className="activity-photo--card"
                />
              }
            />
          ))}
        </div>
      </section>
    </div>
  )
}
