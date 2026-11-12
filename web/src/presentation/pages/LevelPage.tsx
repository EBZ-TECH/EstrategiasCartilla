import { useParams } from 'react-router-dom'
import { getLevelTheme, getOccupationTone } from '../../domain/colorThemes'
import { DownloadPdfButton } from '../components/DownloadPdfButton'
import { InfoToggle } from '../components/InfoToggle'
import { NavCard } from '../components/NavCard'
import { OccupationIcon } from '../components/OccupationIcon'
import { ReadAloudButton } from '../components/ReadAloudButton'
import { useLevel, useOccupations } from '../hooks/useCartilla'
import { useSpeech } from '../hooks/useSpeech'
import { NotFoundPage } from './NotFoundPage'

export function LevelPage() {
  const { levelId } = useParams()
  const level = useLevel(levelId)
  const occupations = useOccupations(levelId)
  const theme = getLevelTheme(level?.id)
  useSpeech({ stopOnUnmount: true })

  if (!level) return <NotFoundPage />

  const listenText = [
    `Nivel ${level.order} de 4: ${level.title}.`,
    level.description,
    level.whyCaregiverTitle,
    level.whyCaregiver,
    `Ahora verá ${occupations.length} áreas. Puede tocar una para continuar.`,
    ...occupations.map((occupation, index) => {
      return `Área ${index + 1}: ${occupation.title}. Tiene ${occupation.activities.length} actividades.`
    }),
    'Toque el área que desea consultar.',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className="page page--mobile-first page--themed"
      style={{
        ['--level-color' as string]: theme.primary,
        ['--theme-primary' as string]: theme.primary,
        ['--theme-soft' as string]: theme.soft,
      }}
    >
      <header className="screen-head">
        <p className="screen-head__badge">Nivel {level.order} de 4</p>
        <p className="section__eyebrow">Temática {level.shortTitle}</p>
        <h1>{level.shortTitle}</h1>
        <p className="screen-head__hint">Toque un área para ver las actividades</p>
        <div className="screen-head__actions">
          <ReadAloudButton text={listenText} label="Escuchar esta página" size="lg" />
          <DownloadPdfButton level={level} />
        </div>
      </header>

      <InfoToggle title="Leer explicación del nivel">
        <p>{level.description}</p>
        {level.whyCaregiverTitle ? <h3>{level.whyCaregiverTitle}</h3> : null}
        {level.whyCaregiver ? <p>{level.whyCaregiver}</p> : null}
      </InfoToggle>

      <section className="section section--priority" aria-labelledby="areas-title">
        <div className="section__head section__head--compact">
          <div>
            <p className="section__eyebrow">Paso 2</p>
            <h2 id="areas-title">Áreas</h2>
          </div>
          <p>{occupations.length} opciones</p>
        </div>

        <div className="nav-card-list">
          {occupations.map((occupation, index) => (
            <NavCard
              key={occupation.id}
              to={`/nivel/${level.id}/${occupation.id}`}
              title={`${index + 1}. ${occupation.shortTitle}`}
              subtitle={`${occupation.activities.length} actividades · tocar para abrir`}
              tone={getOccupationTone(occupation.id, level.id)}
              icon={<OccupationIcon name={occupation.icon} />}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
