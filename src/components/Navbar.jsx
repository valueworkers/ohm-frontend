import './Navbar.css'

function Navbar({ onLoginClick }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="#home" className="navbar-brand">
          <span className="navbar-logo" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="currentColor" />
              <path
                d="M10 26V14h4.2c2.4 0 3.9 1.2 3.9 3.1 0 1.3-.7 2.3-1.9 2.8L20 26h-3.2l-3.2-5.5H13V26H10zm3-8.2h1.1c1 0 1.5-.5 1.5-1.2s-.5-1.2-1.5-1.2H13v2.4zm10.5 8.6c-3.1 0-5.2-2.2-5.2-5.4s2.1-5.4 5.2-5.4 5.2 2.2 5.2 5.4-2.1 5.4-5.2 5.4zm0-2.5c1.5 0 2.4-1.2 2.4-2.9s-.9-2.9-2.4-2.9-2.4 1.2-2.4 2.9.9 2.9 2.4 2.9z"
                fill="#fff"
              />
            </svg>
          </span>
          <span className="navbar-name">O-HM</span>
        </a>

        <nav className="navbar-links" aria-label="Primary">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
        </nav>

        <button type="button" className="navbar-login" onClick={onLoginClick}>
          Login
        </button>
      </div>
    </header>
  )
}

export default Navbar
