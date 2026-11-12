import { getLevelTheme } from '../../domain/colorThemes'
import { getUsageManualSpeechText, siteInfo } from '../../domain/siteInfo'
import { NavCard } from '../components/NavCard'
import { ReadAloudButton } from '../components/ReadAloudButton'
import { UsageManual } from '../components/UsageManual'
import { useLevels } from '../hooks/useCartilla'
import { useSpeech } from '../hooks/useSpeech'

const LEVEL_HELP: Record<string, string> = {
  normal: 'Recuerda bien y se orienta en su día a día',
  leve: 'A veces olvida y necesita recordatorios',
  moderado: 'Necesita más ayuda para organizar tareas',
  severo: 'Necesita acompañamiento casi todo el tiempo',
}

export function HomePage() {
  const levels = useLevels()
  const { brand, researchers } = siteInfo
  useSpeech({ stopOnUnmount: true })

  const introText = [
    brand.name + '.',
    brand.subtitle,
    getUsageManualSpeechText(),
    'Estos son los niveles disponibles:',
    ...levels.map((level) => {
      const help = LEVEL_HELP[level.id] ?? level.title
      return `Nivel ${level.order}: ${level.shortTitle}. ${help}. Nombre completo: ${level.title}.`
    }),
    'Toque el botón grande del nivel que mejor describe a la persona.',
  ].join(' ')

  return (
    <div className="page page--mobile-first home-page">
      <header className="screen-head screen-head--home brand-hero">
        <img className="brand-hero__logo" src={brand.logoSrc} alt={brand.logoAlt} />
        <p className="screen-head__badge">Cartilla virtual</p>
        <h1 className="brand-hero__title">
          <span className="brand-hero__name">{brand.name}</span>
        </h1>
        <p className="brand-hero__subtitle">{brand.subtitle}</p>
        <p className="brand-hero__credit">
          Investigación: {researchers.names.join(' · ')}
        </p>
        <div className="screen-head__actions">
          <UsageManual autoOpenOnce />
          <ReadAloudButton text={introText} label="Escuchar esta página" size="lg" />
        </div>
      </header>

      <section id="niveles" className="section section--priority" aria-labelledby="niveles-title">
        <div className="section__head section__head--compact">
          <div>
            <p className="section__eyebrow">Paso 1</p>
            <h2 id="niveles-title">Elija el nivel</h2>
          </div>
          <p>4 opciones claras</p>
        </div>

        <div className="nav-card-list">
          {levels.map((level) => {
            const theme = getLevelTheme(level.id)
            return (
              <NavCard
                key={level.id}
                to={`/nivel/${level.id}`}
                title={`${level.order}. ${level.shortTitle}`}
                subtitle={LEVEL_HELP[level.id] ?? level.title}
                tone={theme.primary}
                icon={<span className="nav-card__index">{level.order}</span>}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}
