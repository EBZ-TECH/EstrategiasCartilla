import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { speechService } from '../../application/services/SpeechService'
import { siteInfo } from '../../domain/siteInfo'
import { useStickyBack } from '../hooks/useStickyBack'
import { BackNav } from './BackNav'
import { FontControls } from './FontControls'

export function AppShell() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const back = useStickyBack()
  const { company, developer } = siteInfo

  useEffect(() => {
    speechService.stop()
  }, [location.pathname])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>

      <header className={`topbar${isHome ? ' topbar--home' : ''}`}>
        <div className="topbar__inner">
          {back ? <BackNav to={back.to} label={back.label} compact /> : <span />}

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
