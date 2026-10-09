import heroImage from '../assets/adver.jpeg'
import './Hero.css'

function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-brand">
      <div className="hero-content">
        <p id="hero-brand" className="hero-brand">
          O-HM
        </p>
        <h1 className="hero-title">One platform for complete senior care management</h1>
        <p className="hero-lead">
          You care for seniors. We simplify your operations — attendance, bookings,
          payments, leads, marketing, and your own website.
        </p>
        <div className="hero-actions">
          <a href="#onboarding" className="hero-cta">
            Onboard your care community
          </a>
          <a href="#tenants" className="hero-cta-secondary">
            Browse providers
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
