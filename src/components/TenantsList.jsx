import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../api/auth'
import { listTenants } from '../api/tenants'
import { useReveal } from '../hooks/useReveal'
import './TenantsList.css'

function formatStatus(status) {
  if (!status) return 'Unknown'
  return status.replace(/_/g, ' ')
}

function TenantsList() {
  const sectionRef = useReveal()
  const location = useLocation()
  const [tenants, setTenants] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasAuth, setHasAuth] = useState(() => isAuthenticated())

  useEffect(() => {
    const authed = isAuthenticated()
    setHasAuth(authed)

    if (!authed) {
      setTenants([])
      setErrorMessage('')
      setIsLoading(false)
      return undefined
    }

    let cancelled = false
    setIsLoading(true)
    setErrorMessage('')

    listTenants()
      .then((data) => {
        if (!cancelled) setTenants(data)
      })
      .catch((error) => {
        if (!cancelled) {
          setTenants([])
          setErrorMessage(error.message || 'Could not load care providers.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [location.pathname, location.key])

  return (
    <section
      id="tenants"
      className="tenants reveal"
      ref={sectionRef}
      aria-labelledby="tenants-heading"
    >
      <div className="tenants-inner">
        <p className="section-eyebrow">Directory</p>
        <h2 id="tenants-heading">Care providers on O-HM</h2>
        <p className="tenants-lead">
          Browse care providers on O-HM, including domains and contact details.
        </p>

        {!hasAuth ? (
          <div className="tenants-empty" role="status">
            <p>Sign in to view care providers on O-HM.</p>
            <Link to="/login" className="tenants-login-link">
              Go to login
            </Link>
          </div>
        ) : null}

        {hasAuth && isLoading ? (
          <p className="tenants-state" role="status">
            Loading care providers…
          </p>
        ) : null}

        {hasAuth && errorMessage ? (
          <p className="tenants-state is-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {hasAuth && !isLoading && !errorMessage && tenants.length === 0 ? (
          <p className="tenants-state" role="status">
            No care providers found yet.
          </p>
        ) : null}

        {hasAuth && tenants.length > 0 ? (
          <ul className="tenants-grid">
            {tenants.map((tenant, index) => {
              const primaryDomain =
                tenant.domains?.find((domain) => domain.is_primary)?.domain ||
                tenant.domains?.[0]?.domain ||
                `${tenant.schema_name}.o-hm.com`

              return (
                <li
                  key={tenant.id}
                  className="tenant-card"
                  style={{ '--card-index': index }}
                >
                  <Link to={`/tenants/${tenant.id}`} className="tenant-card-link">
                    <div className="tenant-card-top">
                      <span className={`tenant-status is-${tenant.status || 'unknown'}`}>
                        {formatStatus(tenant.status)}
                      </span>
                      {tenant.logo ? (
                        <img
                          src={tenant.logo}
                          alt={`${tenant.name} logo`}
                          className="tenant-logo"
                        />
                      ) : (
                        <span className="tenant-logo-fallback" aria-hidden="true">
                          {tenant.name?.charAt(0) || 'T'}
                        </span>
                      )}
                    </div>

                    <h3>{tenant.name}</h3>
                    <p className="tenant-domain">{primaryDomain}</p>

                    <dl className="tenant-details">
                      <div>
                        <dt>Email</dt>
                        <dd>{tenant.contact_email || '—'}</dd>
                      </div>
                      <div>
                        <dt>Phone</dt>
                        <dd>{tenant.contact_phone || '—'}</dd>
                      </div>
                      <div>
                        <dt>Timezone</dt>
                        <dd>{tenant.timezone || '—'}</dd>
                      </div>
                    </dl>

                    {tenant.domains?.length > 0 ? (
                      <>
                        <div className="tenant-separator" role="presentation">
                          <span className="tenant-separator-line" />
                          <span className="tenant-separator-label">Domains</span>
                          <span className="tenant-separator-line" />
                        </div>
                        <ul className="tenant-domains">
                          {tenant.domains.map((domain) => (
                            <li key={domain.id}>
                              <span>{domain.domain}</span>
                              {domain.is_primary ? (
                                <span className="domain-pill">Primary</span>
                              ) : null}
                              {domain.verified ? (
                                <span className="domain-pill is-verified">Verified</span>
                              ) : (
                                <span className="domain-pill">Unverified</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}

                    <span className="tenant-card-cta">View details</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

export default TenantsList
