import { useEffect, useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { speechService } from '../../application/services/SpeechService'
import { getLevelTheme, getOccupationTone } from '../../domain/colorThemes'
import { siteInfo } from '../../domain/siteInfo'
import { useStickyBack } from '../hooks/useStickyBack'
import { BackNav } from './BackNav'
import { FontControls } from './FontControls'
import { MosaicBackground } from './MosaicBackground'

function routeThemeIds(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] !== 'nivel') return { levelId: undefined, occupationId: undefined }
  return { levelId: parts[1], occupationId: parts[2] }
}

export function AppShell() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const back = useStickyBack()
  const { brand, company, developer, researchers } = siteInfo

  const { levelId, occupationId } = routeThemeIds(location.pathname)
  const theme = useMemo(() => getLevelTheme(levelId), [levelId])
  const mosaicPrimary = occupationId
    ? getOccupationTone(occupationId, levelId)
    : theme.primary

  useEffect(() => {
    speechService.stop()
  }, [location.pathname])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--theme-primary', theme.primary)
    root.style.setProperty('--theme-soft', theme.soft)
    root.style.setProperty('--theme-accent', theme.accent)
    root.style.setProperty('--theme-ink', theme.ink)
    root.style.setProperty('--primary', theme.primary)
    root.style.setProperty('--primary-deep', theme.ink)
    root.style.setProperty('--primary-soft', theme.soft)
    root.style.setProperty('--accent', theme.accent)
    root.style.setProperty('--bg', theme.soft)
  }, [theme])

  return (
    <div
      className={`app-shell${isHome ? ' app-shell--home' : ''}`}
      style={{ ['--level-color' as string]: theme.primary }}
    >
      <MosaicBackground primary={mosaicPrimary} accent={theme.accent} />

      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>

      <header className={`topbar${isHome ? ' topbar--home' : ''}`}>
        <div className="topbar__inner">
          {back ? <BackNav to={back.to} label={back.label} compact /> : (
            <div className="topbar__brand-chip" aria-hidden={false}>
              <img src={brand.logoSrc} alt="" className="topbar__brand-logo" />
              <strong>{brand.shortName}</strong>
            </div>
          )}

          <div className="topbar__tools">
            <FontControls />
          </div>
        </div>
      </header>

      <main id="contenido" className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__grid">
            <section className="footer__block" aria-labelledby="footer-research">
              <h2 id="footer-research">{researchers.title}</h2>
              {researchers.names.map((name) => (
                <p key={name}>
                  <strong>{name}</strong>
                </p>
              ))}
              <p className="footer__note">{researchers.note}</p>
            </section>

            <section className="footer__block" aria-labelledby="footer-company">
              <h2 id="footer-company">{company.name}</h2>
              <p>
                Correo:{' '}
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </p>
              <p>
                Soporte:{' '}
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </p>
            </section>

            <section className="footer__block" aria-labelledby="footer-dev">
              <h2 id="footer-dev">{developer.role}</h2>
              <p>
                <strong>{developer.name}</strong>
              </p>
              {developer.phone ? (
                <p>
                  Contacto:{' '}
                  <a href={developer.phoneHref || `tel:${developer.phone}`}>
                    {developer.phone}
                  </a>
                </p>
              ) : null}
              <p className="footer__note">{developer.note}</p>
            </section>
          </div>
        </div>
      </footer>
    </div>
  )
}
