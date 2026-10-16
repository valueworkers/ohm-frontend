import { Link } from 'react-router-dom'
import heroImage from '../assets/adver.jpeg'
import './Hero.css'

function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-brand">
      <div className="hero-content">
        <p className="hero-eyebrow">One unified platform</p>
        <p id="hero-brand" className="hero-brand">
          O-HM
        </p>
        <h1 className="hero-title">One platform for complete care management</h1>
        <p className="hero-lead">
          One unified platform for senior care, pharma care, and more. We simplify
          your operations: attendance, bookings, payments, leads, marketing, and
          your own website.
        </p>
        <div className="hero-actions">
          <Link to="/book-care" className="hero-cta">
            Book a caregiver
          </Link>
          <a href="#onboarding" className="hero-cta-secondary">
            Onboard your care community
          </a>
        </div>
      </div>

      <div className="hero-media">
        <div className="hero-card">
          <img
            src={heroImage}
            alt="O-HM senior care platform: caregiver with a resident, features for attendance, booking, payments, leads, marketing, and website creation"
            className="hero-image"
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
