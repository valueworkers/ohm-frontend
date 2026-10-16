import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { clearAuthSession, getAuthSession } from '../api/auth'
import { SESSION_EVENT } from '../api/session'
import './Navbar.css'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [session, setSession] = useState(() => getAuthSession())
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    function syncSession() {
      setSession(getAuthSession())
    }

    syncSession()
    window.addEventListener(SESSION_EVENT, syncSession)
    return () => window.removeEventListener(SESSION_EVENT, syncSession)
  }, [location.pathname])

  async function handleLogout() {
    if (isLoggingOut) return

    setIsLoggingOut(true)
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
    ''

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
          <div className="navbar-user">
            <span className="navbar-user-name" title={displayName}>
              {displayName}
            </span>
            <button
              type="button"
              className="navbar-login"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out…' : 'Logout'}
            </button>
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
