import { Link } from 'react-router-dom'
import './SiteFooter.css'

function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">
            <span className="site-footer-mark" aria-hidden="true" />
            <span>O-HM</span>
          </Link>
          <p>
            One unified platform for senior care, pharma care, and more. Helping
            families find care and helping providers run operations.
          </p>
        </div>

        <nav className="site-footer-nav" aria-label="Footer">
          <div className="site-footer-col">
            <h2>Explore</h2>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/#about">About Us</Link>
              </li>
              <li>
                <Link to="/pricing">Pricing</Link>
              </li>
              <li>
                <Link to="/book-care">Book a caregiver</Link>
              </li>
            </ul>
          </div>

          <div className="site-footer-col">
            <h2>For providers</h2>
            <ul>
              <li>
                <Link to="/#onboarding">Tenant onboarding</Link>
              </li>
              <li>
                <Link to="/pricing">Plans & pricing</Link>
              </li>
              <li>
                <Link to="/login">Provider login</Link>
              </li>
            </ul>
          </div>

          <div className="site-footer-col">
            <h2>Contact</h2>
            <ul>
              <li>
                <a href="tel:+919611235211">Call +91 96112 35211</a>
              </li>
              <li>
                <a
                  href="https://wa.me/919611235211"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp support
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="site-footer-bottom">
        <p>© {year} O-HM. All rights reserved.</p>
        <p>Digitise your care services with clarity and trust.</p>
      </div>
    </footer>
  )
}

export default SiteFooter
