import './Navbar.css'

function Navbar({ onLoginClick }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="#home" className="navbar-brand">
          <span className="navbar-logo" aria-hidden="true" />
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
