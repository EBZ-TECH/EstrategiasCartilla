import { useParams } from 'react-router-dom'
import { getActivityTone, getLevelTheme, getOccupationTone } from '../../domain/colorThemes'
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
  const theme = getLevelTheme(level?.id)
  const areaTone = getOccupationTone(occupation?.id, level?.id)
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
    <div
      className="page page--mobile-first page--themed"
      style={{
        ['--level-color' as string]: areaTone,
        ['--theme-primary' as string]: areaTone,
        ['--theme-soft' as string]: theme.soft,
      }}
    >
      <header className="screen-head">
        <p className="screen-head__badge">{level.shortTitle}</p>
        <p className="section__eyebrow">Área ocupacional</p>
        <h1>{occupation.shortTitle}</h1>
        <p className="screen-head__hint">Toque una actividad</p>
        <ReadAloudButton text={listenText} label="Escuchar esta página" size="lg" />
      </header>

      <section className="section section--priority" aria-labelledby="actividades-title">
        <div className="section__head section__head--compact">
          <div>
            <p className="section__eyebrow">Paso 3</p>
            <h2 id="actividades-title">Actividades</h2>
          </div>
          <p>{occupation.activities.length} temas</p>
        </div>

        <div className="nav-card-list">
          {occupation.activities.map((activity, index) => (
            <NavCard
              key={activity.id}
              to={`/nivel/${level.id}/${occupation.id}/${activity.id}`}
              title={`${index + 1}. ${activity.title}`}
              subtitle={`${activity.strategies.length} consejos · tocar para abrir`}
              tone={getActivityTone(occupation.id, index, level.id)}
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
