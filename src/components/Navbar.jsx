import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { clearAuthSession, getAuthSession, isSuperAdmin } from '../api/auth'
import { SESSION_EVENT } from '../api/session'
import './Navbar.css'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [session, setSession] = useState(() => getAuthSession())
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    function syncSession() {
      setSession(getAuthSession())
    }

    syncSession()
    window.addEventListener(SESSION_EVENT, syncSession)
    return () => window.removeEventListener(SESSION_EVENT, syncSession)
  }, [location.pathname])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMenuOpen) return undefined

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown)
      document.addEventListener('keydown', handleKeyDown)
    }, 0)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  async function handleLogout() {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setIsMenuOpen(false)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 500))
      clearAuthSession()
      setSession(null)
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const displayName =
    session?.user?.full_name?.trim() ||
    session?.user?.email ||
    'Account'
  const showOwnerLinks = Boolean(session?.access) && !isSuperAdmin(session)

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo" aria-hidden="true" />
          <span className="navbar-name">O-HM</span>
        </Link>

        <nav className="navbar-links" aria-label="Primary">
          <NavLink to="/" end>
            Home
          </NavLink>
          <Link to="/#about">About Us</Link>
          <NavLink to="/pricing">Pricing</NavLink>
        </nav>

        {session?.access ? (
          <div className="navbar-user" ref={menuRef}>
            <button
              type="button"
              className={`navbar-account${isMenuOpen ? ' is-open' : ''}`}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              aria-controls="navbar-account-menu"
              onClick={(event) => {
                event.stopPropagation()
                setIsMenuOpen((open) => !open)
              }}
            >
              <span className="navbar-user-name" title={displayName}>
                {displayName}
              </span>
              <span className="navbar-account-caret" aria-hidden="true">
                ▾
              </span>
            </button>

            {isMenuOpen ? (
              <div
                id="navbar-account-menu"
                className="navbar-menu"
                role="menu"
                aria-label="Account"
              >
                {showOwnerLinks ? (
                  <>
                    <Link
                      to="/my-tenants"
                      role="menuitem"
                      className="navbar-menu-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My tenants
                    </Link>
                    <Link
                      to="/profile"
                      role="menuitem"
                      className="navbar-menu-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <div className="navbar-menu-divider" role="separator" />
                  </>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  className="navbar-menu-item is-danger"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Logging out…' : 'Logout'}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <Link to="/login" className="navbar-login">
            Login
          </Link>
        )}
      </div>
    </header>
  )
}

export default Navbar
