import { useEffect, useState } from 'react'
import { fetchPlans } from '../api/plans'
import { useReveal } from '../hooks/useReveal'
import './PricingSection.css'

function formatPrice(plan) {
  const amount = plan.price ?? plan.monthly_price ?? plan.amount
  if (amount == null || amount === '') return null

  const numeric = Number(amount)
  if (Number.isFinite(numeric)) {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: plan.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(numeric)
    return `${formatted}/mo`
  }

  return String(amount)
}

function PricingSection() {
  const sectionRef = useReveal()
  const [plans, setPlans] = useState([])
  const [state, setState] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadPlans() {
      setState('loading')
      setErrorMessage('')
      try {
        const list = await fetchPlans()
        if (cancelled) return
        setPlans(list)
        setState(list.length ? 'ready' : 'empty')
      } catch (error) {
        if (cancelled) return
        setPlans([])
        setState('error')
        setErrorMessage(error.message || 'Could not load plans.')
      }
    }

    loadPlans()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section
      id="pricing"
      className="pricing reveal"
      ref={sectionRef}
      aria-labelledby="pricing-heading"
    >
      <div className="pricing-inner">
        <div className="pricing-intro">
          <p className="section-eyebrow">Compare plans</p>
          <h2 id="pricing-heading">Find the right fit</h2>
          <p className="pricing-lead">
            Each plan scales with your team size, locations, and feature needs.
          </p>
        </div>

        {state === 'loading' ? (
          <p className="pricing-status">Loading plans…</p>
        ) : null}

        {state === 'error' ? (
          <p className="pricing-status is-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {state === 'empty' ? (
          <p className="pricing-status">No plans available right now.</p>
        ) : null}

        {state === 'ready' ? (
          <ul className="pricing-grid">
            {plans.map((plan, index) => {
              const priceLabel = formatPrice(plan)
              const features = Array.isArray(plan.features)
                ? plan.features.map((feature) => feature?.name).filter(Boolean)
                : []
              const isFeatured =
                plans.length >= 3
                  ? index === Math.floor(plans.length / 2)
                  : index === 0

              return (
                <li
                  key={plan.id}
                  className={`pricing-card reveal-delay-${(index % 3) + 1}${
                    isFeatured ? ' is-featured' : ''
                  }`}
                >
                  {isFeatured ? (
                    <p className="pricing-card-badge">Popular</p>
                  ) : null}
                  <h3 className="pricing-card-name">{plan.name}</h3>
                  {priceLabel ? (
                    <p className="pricing-card-price">{priceLabel}</p>
                  ) : null}
                  {plan.description ? (
                    <p className="pricing-card-desc">{plan.description}</p>
                  ) : null}
                  <p className="pricing-card-meta">
                    {plan.max_employees != null
                      ? `Up to ${plan.max_employees} employees`
                      : null}
                    {plan.max_employees != null && plan.max_branches != null
                      ? ' · '
                      : null}
                    {plan.max_branches != null
                      ? `${plan.max_branches} branches`
                      : null}
                  </p>
                  {features.length ? (
                    <ul className="pricing-card-features">
                      {features.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

export default PricingSection
