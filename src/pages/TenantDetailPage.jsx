import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTenant } from '../api/tenants'
import { buildTenantBasePath } from '../template/tenantContext'
import './TenantDetailPage.css'

function formatStatus(status) {
  if (!status) return 'Unknown'
  return status.replace(/_/g, ' ')
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function TenantDetailPage() {
  const { tenantId } = useParams()
  const [tenant, setTenant] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setErrorMessage('')

    getTenant(tenantId)
      .then((data) => {
        if (!cancelled) setTenant(data)
      })
      .catch((error) => {
        if (!cancelled) {
          setTenant(null)
          setErrorMessage(error.message || 'Could not load tenant details.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tenantId])

  const primaryDomain =
    tenant?.domains?.find((domain) => domain.is_primary)?.domain ||
    tenant?.domains?.[0]?.domain ||
    (tenant?.schema_name ? `${tenant.schema_name}.o-hm.com` : '—')

  const branches = tenant?.branches || tenant?.locations || []
  const tenantSlug = tenant?.slug || tenant?.schema_name || null
  const templatePath = buildTenantBasePath(tenantSlug, tenant?.id)

  return (
    <section className="tenant-detail" aria-labelledby="tenant-detail-title">
      <div className="tenant-detail-inner">
        <p className="tenant-detail-back">
          <Link to="/#tenants">← Back to care providers</Link>
        </p>

        {isLoading ? (
          <p className="tenant-detail-state" role="status">
            Loading tenant details…
          </p>
        ) : null}

        {errorMessage ? (
          <p className="tenant-detail-state is-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {!isLoading && !errorMessage && tenant ? (
          <article className="tenant-detail-card">
            <header className="tenant-detail-header">
              <div className="tenant-detail-identity">
                {tenant.logo ? (
                  <img
                    src={tenant.logo}
                    alt={`${tenant.name} logo`}
                    className="tenant-detail-logo"
                  />
                ) : (
                  <span className="tenant-detail-logo-fallback" aria-hidden="true">
                    {tenant.name?.charAt(0) || 'T'}
                  </span>
                )}
                <div>
                  <p className="section-eyebrow">Care provider</p>
                  <h1 id="tenant-detail-title">{tenant.name}</h1>
                  <p className="tenant-detail-domain">{primaryDomain}</p>
                </div>
              </div>
              <div className="tenant-detail-actions">
                <span className={`tenant-status is-${tenant.status || 'unknown'}`}>
                  {formatStatus(tenant.status)}
                </span>
                {templatePath ? (
                  <a className="tenant-detail-open" href={`${templatePath}/`}>
                    Open tenant site
                  </a>
                ) : null}
              </div>
            </header>

            <dl className="tenant-detail-grid">
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
              <div>
                <dt>Currency</dt>
                <dd>{tenant.default_currency || '—'}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(tenant.created_at)}</dd>
              </div>
            </dl>

            <section className="tenant-detail-section" aria-labelledby="domains-heading">
              <h2 id="domains-heading">Domains</h2>
              {tenant.domains?.length ? (
                <ul className="tenant-detail-list">
                  {tenant.domains.map((domain) => (
                    <li key={domain.id}>
                      <strong>{domain.domain}</strong>
                      <div className="tenant-detail-pills">
                        {domain.is_primary ? (
                          <span className="domain-pill">Primary</span>
                        ) : null}
                        {domain.verified ? (
                          <span className="domain-pill is-verified">Verified</span>
                        ) : (
                          <span className="domain-pill">Unverified</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="tenant-detail-muted">No domains listed.</p>
              )}
            </section>

            {branches.length > 0 ? (
              <section className="tenant-detail-section" aria-labelledby="branches-heading">
                <h2 id="branches-heading">Branches</h2>
                <ul className="tenant-detail-list">
                  {branches.map((branch, index) => (
                    <li key={branch.id || `${branch.name}-${index}`}>
                      <strong>{branch.name || `Branch ${index + 1}`}</strong>
                      <p>{branch.address || branch.city || '—'}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </article>
        ) : null}
      </div>
    </section>
  )
}

export default TenantDetailPage
