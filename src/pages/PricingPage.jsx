import { Link } from 'react-router-dom'
import PricingSection from '../components/PricingSection'
import './PricingPage.css'

function PricingPage() {
  return (
    <div className="pricing-page">
      <header className="pricing-page-hero">
        <div className="pricing-page-hero-inner">
          <p className="pricing-page-eyebrow">Transparent plans</p>
          <h1 className="pricing-page-title">Pricing built for care providers</h1>
          <p className="pricing-page-lead">
            Clear limits. Clear features. Pick a plan when you are ready — or
            onboard first and decide later.
          </p>
          <Link to="/#onboarding" className="pricing-page-cta">
            Start onboarding
          </Link>
        </div>
      </header>
      <PricingSection />
    </div>
  )
}

export default PricingPage
