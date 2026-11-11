import { ReadAloudButton } from '../components/ReadAloudButton'
import { NavCard } from '../components/NavCard'
import { useCartillaMeta, useLevels } from '../hooks/useCartilla'
import { useSpeech } from '../hooks/useSpeech'

const LEVEL_TONES: Record<string, string> = {
  normal: '#43A047',
  leve: '#2F6FE0',
  moderado: '#F2A012',
  severo: '#E53935',
}

const LEVEL_HELP: Record<string, string> = {
  normal: 'Recuerda bien y se orienta en su día a día',
  leve: 'A veces olvida y necesita recordatorios',
  moderado: 'Necesita más ayuda para organizar tareas',
  severo: 'Necesita acompañamiento casi todo el tiempo',
}

export function HomePage() {
  const meta = useCartillaMeta()
  const levels = useLevels()
  useSpeech({ stopOnUnmount: true })

  const introText = [
    meta.title + '.',
    'Toque un nivel para empezar.',
    'Estos son los niveles disponibles:',
    ...levels.map((level) => {
      const help = LEVEL_HELP[level.id] ?? level.title
      return `Nivel ${level.order}: ${level.shortTitle}. ${help}. Nombre completo: ${level.title}.`
    }),
    'Toque el botón grande del nivel que mejor describe a la persona.',
  ].join(' ')

  return (
    <div className="page page--mobile-first home-page">
      <header className="screen-head screen-head--home">
        <p className="screen-head__badge">Cartilla virtual</p>
        <h1>{meta.title}</h1>
        <p className="screen-head__hint">
          Toque un nivel para empezar. Todo está en botones grandes.
        </p>
        <ReadAloudButton text={introText} label="Escuchar esta página" size="lg" />
      </header>

      <section id="niveles" className="section section--priority" aria-labelledby="niveles-title">
        <div className="section__head section__head--compact">
          <h2 id="niveles-title">Elija el nivel</h2>
          <p>4 opciones claras</p>
        </div>

        <div className="nav-card-list">
          {levels.map((level) => (
            <NavCard
              key={level.id}
              to={`/nivel/${level.id}`}
              title={`${level.order}. ${level.shortTitle}`}
              subtitle={LEVEL_HELP[level.id] ?? level.title}
              tone={LEVEL_TONES[level.id] ?? level.color}
              icon={<span className="nav-card__index">{level.order}</span>}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
