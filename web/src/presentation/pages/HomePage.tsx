import { getLevelTheme } from '../../domain/colorThemes'
import { getUsageManualSpeechText, siteInfo } from '../../domain/siteInfo'
import { DownloadPdfButton } from '../components/DownloadPdfButton'
import { NavCard } from '../components/NavCard'
import { ReadAloudButton } from '../components/ReadAloudButton'
import { ReferencesPanel } from '../components/ReferencesPanel'
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
  const { brand, researchers, university } = siteInfo
  useSpeech({ stopOnUnmount: true })

  const introText = [
    brand.name + '.',
    brand.subtitle,
    `Investigación de ${researchers.names.join(' y ')}, Universidad de Santander.`,
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
      <header className="cover-card">
        <div className="cover-card__top">
          <img className="cover-card__logo" src={brand.logoSrc} alt={brand.logoAlt} />
          <p className="cover-card__badge">Cartilla virtual</p>
        </div>

        <div className="cover-card__copy">
          <p className="cover-card__kicker">{brand.shortName}</p>
          <h1 className="cover-card__title">Ocupaciones para la vida</h1>
          <p className="cover-card__subtitle">{brand.subtitle}</p>
        </div>

        <div className="cover-card__research">
          <img
            className="cover-card__udes"
            src={university.logoSrc}
            alt={university.logoAlt}
          />
          <div className="cover-card__research-text">
            <p className="cover-card__research-label">Investigación académica</p>
            <p className="cover-card__research-names">
              {researchers.names.join(' · ')}
            </p>
            <p className="cover-card__research-uni">{university.name}</p>
          </div>
        </div>

        <div className="cover-card__actions">
          <UsageManual autoOpenOnce />
          <ReadAloudButton text={introText} label="Escuchar esta página" size="lg" />
        </div>

        <div className="cover-card__actions cover-card__actions--secondary">
          <ReferencesPanel />
        </div>

        <DownloadPdfButton
          mode="all"
          levels={levels}
          className="cover-card__download"
          label="Descargar cartilla completa (PDF)"
        />
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
