import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  getAuthSession,
  isAuthenticated,
  isSuperAdmin,
} from '../api/auth'
import {
  activateMyTenant,
  listMyTenants,
  updateMyTenant,
} from '../api/myTenants'
import {
  getTenantPrimaryDomain,
  getTenantSlug,
  navigateToTenantSite,
  rememberTenantForSite,
} from '../utils/tenantSite'
import './MyTenantsPage.css'

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'UTC',
  'America/New_York',
  'Europe/London',
]

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED']

function formatStatus(status) {
  if (!status) return 'Unknown'
  return String(status).replace(/_/g, ' ')
}

function emptyEditForm() {
  return {
    name: '',
    contact_email: '',
    contact_phone: '',
    timezone: 'Asia/Kolkata',
    default_currency: 'INR',
    tags: '',
    logo: null,
    logoPreview: '',
  }
}

function MyTenantsPage() {
  const session = getAuthSession()
  const canAccess = isAuthenticated() && !isSuperAdmin(session)

  const [tenants, setTenants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(emptyEditForm)

  async function loadTenants() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const data = await listMyTenants()
      setTenants(data)
    } catch (error) {
      setTenants([])
      setErrorMessage(error.message || 'Could not load your tenants.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!canAccess) return undefined
    loadTenants()
    return undefined
  }, [canAccess])

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (isSuperAdmin(session)) {
    return <Navigate to="/" replace />
  }

  function startEdit(tenant) {
    setEditingId(tenant.id)
    setEditForm({
      name: tenant.name || tenant.organization_name || '',
      contact_email: tenant.contact_email || tenant.email || '',
      contact_phone: tenant.contact_phone || tenant.phone || '',
      timezone: tenant.timezone || 'Asia/Kolkata',
      default_currency: tenant.default_currency || 'INR',
      tags: Array.isArray(tenant.tags) ? tenant.tags.join(', ') : '',
      logo: null,
      logoPreview: tenant.logo || '',
    })
    setActionMessage('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(emptyEditForm())
  }

  async function handleLogoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setEditForm((prev) => ({
      ...prev,
      logo: file,
      logoPreview: URL.createObjectURL(file),
    }))
  }

  async function handleSaveEdit(event) {
    event.preventDefault()
    if (!editingId) return

    setBusyId(editingId)
    setActionMessage('')
    try {
      await updateMyTenant(editingId, {
        name: editForm.name.trim(),
        contact_email: editForm.contact_email.trim(),
        contact_phone: editForm.contact_phone.trim(),
        timezone: editForm.timezone.trim(),
        default_currency: editForm.default_currency.trim(),
        tags: editForm.tags,
        logo: editForm.logo,
      })
      cancelEdit()
      await loadTenants()
      setActionMessage('Tenant updated.')
    } catch (error) {
      setActionMessage(error.message || 'Could not update tenant.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleActivate(tenant) {
    setBusyId(tenant.id)
    setActionMessage('')
    try {
      await activateMyTenant(tenant.id)
      const data = await listMyTenants()
      setTenants(data)
      const current =
        data.find((item) => String(item.id) === String(tenant.id)) || {
          ...tenant,
          status: 'active',
        }
      setActionMessage('Tenant activated.')
      navigateToTenantSite(current)
    } catch (error) {
      setActionMessage(error.message || 'Could not activate tenant.')
    } finally {
      setBusyId(null)
    }
  }

  function handleOpenSite(tenant) {
    rememberTenantForSite(tenant)
    if (!navigateToTenantSite(tenant)) {
      setActionMessage('No domain available for this tenant yet.')
    }
  }

  return (
    <section className="my-tenants" aria-labelledby="my-tenants-title">
      <div className="my-tenants-inner">
        <div className="my-tenants-header">
          <div>
            <p className="section-eyebrow">Owner</p>
            <h1 id="my-tenants-title">My tenants</h1>
            <p className="my-tenants-lead">
              Edit organization details, then open your site when ready.
            </p>
          </div>
          <div className="my-tenants-actions">
            <Link to="/profile">Profile</Link>
            <button type="button" className="my-tenants-btn" onClick={loadTenants}>
              Refresh
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="my-tenants-state" role="status">
            Loading your tenants…
          </p>
        ) : null}

        {errorMessage ? (
          <p className="my-tenants-state is-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {actionMessage ? (
          <p className="my-tenants-state" role="status">
            {actionMessage}
          </p>
        ) : null}

        {!isLoading && !errorMessage && tenants.length === 0 ? (
          <p className="my-tenants-state" role="status">
            No tenants found for this account.
          </p>
        ) : null}

        {tenants.length > 0 ? (
          <ul className="my-tenants-list">
            {tenants.map((tenant) => {
              const slug = getTenantSlug(tenant)
              const domain = getTenantPrimaryDomain(tenant)
              const status = String(tenant.status || '').toLowerCase()
              const isActive = status === 'active'
              const owners = Array.isArray(tenant.owners) ? tenant.owners : []
              const modules = Array.isArray(tenant.modules) ? tenant.modules : []

              return (
                <li key={tenant.id} className="my-tenants-card">
                  <div className="my-tenants-card-top">
                    <div className="my-tenants-identity">
                      {tenant.logo ? (
                        <img
                          src={tenant.logo}
                          alt=""
                          className="my-tenants-logo"
                        />
                      ) : (
                        <span className="my-tenants-logo-fallback" aria-hidden="true">
                          {(tenant.name || 'T').charAt(0)}
                        </span>
                      )}
                      <div>
                        <h2>{tenant.name || `Tenant ${tenant.id}`}</h2>
                        <p className="my-tenants-meta">
                          {domain || (slug ? `${slug}.o-hm.com` : 'No subdomain')}
                          {slug ? ` · schema: ${slug}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className={`my-tenants-status is-${status || 'unknown'}`}>
                      {formatStatus(tenant.status)}
                    </span>
                  </div>

                  <dl className="my-tenants-summary">
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
                      <dt>Tags</dt>
                      <dd>
                        {Array.isArray(tenant.tags) && tenant.tags.length
                          ? tenant.tags.join(', ')
                          : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt>Modules</dt>
                      <dd>{modules.length ? modules.join(', ') : '—'}</dd>
                    </div>
                  </dl>

                  {owners.length > 0 ? (
                    <div className="my-tenants-owners">
                      <p className="my-tenants-owners-label">Owners</p>
                      <ul>
                        {owners.map((owner) => (
                          <li key={owner.id || owner.email}>
                            {owner.full_name || owner.email}
                            {owner.full_name ? ` · ${owner.email}` : ''}
                          </li>
                        ))}
                      </ul>
                      <Link to="/profile" className="my-tenants-owners-link">
                        Manage owners on Profile
                      </Link>
                    </div>
                  ) : null}

                  <div className="my-tenants-card-actions">
                    {!isActive ? (
                      <button
                        type="button"
                        className="my-tenants-btn is-primary"
                        disabled={busyId === tenant.id}
                        onClick={() => handleActivate(tenant)}
                      >
                        {busyId === tenant.id ? 'Activating…' : 'Activate'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="my-tenants-btn is-primary"
                        onClick={() => handleOpenSite(tenant)}
                      >
                        Open {domain || 'site'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="my-tenants-btn"
                      onClick={() =>
                        editingId === tenant.id ? cancelEdit() : startEdit(tenant)
                      }
                    >
                      {editingId === tenant.id ? 'Cancel edit' : 'Edit'}
                    </button>
                  </div>

                  {editingId === tenant.id ? (
                    <form className="my-tenants-edit" onSubmit={handleSaveEdit}>
                      <div className="my-tenants-edit-grid">
                        <div className="my-tenants-field my-tenants-field-full">
                          <label htmlFor={`tenant-name-${tenant.id}`}>Name</label>
                          <input
                            id={`tenant-name-${tenant.id}`}
                            value={editForm.name}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="my-tenants-field">
                          <label htmlFor={`tenant-email-${tenant.id}`}>Contact email</label>
                          <input
                            id={`tenant-email-${tenant.id}`}
                            type="email"
                            value={editForm.contact_email}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                contact_email: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="my-tenants-field">
                          <label htmlFor={`tenant-phone-${tenant.id}`}>Contact phone</label>
                          <input
                            id={`tenant-phone-${tenant.id}`}
                            type="tel"
                            value={editForm.contact_phone}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                contact_phone: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="my-tenants-field">
                          <label htmlFor={`tenant-timezone-${tenant.id}`}>Timezone</label>
                          <select
                            id={`tenant-timezone-${tenant.id}`}
                            value={editForm.timezone}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                timezone: event.target.value,
                              }))
                            }
                          >
                            {TIMEZONES.map((zone) => (
                              <option key={zone} value={zone}>
                                {zone}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="my-tenants-field">
                          <label htmlFor={`tenant-currency-${tenant.id}`}>
                            Default currency
                          </label>
                          <select
                            id={`tenant-currency-${tenant.id}`}
                            value={editForm.default_currency}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                default_currency: event.target.value,
                              }))
                            }
                          >
                            {CURRENCIES.map((code) => (
                              <option key={code} value={code}>
                                {code}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="my-tenants-field my-tenants-field-full">
                          <label htmlFor={`tenant-tags-${tenant.id}`}>
                            Tags (comma separated)
                          </label>
                          <input
                            id={`tenant-tags-${tenant.id}`}
                            value={editForm.tags}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                tags: event.target.value,
                              }))
                            }
                            placeholder="senior-care, home-nursing"
                          />
                        </div>

                        <div className="my-tenants-field my-tenants-field-full">
                          <label htmlFor={`tenant-logo-${tenant.id}`}>Logo</label>
                          <div className="my-tenants-logo-edit">
                            {editForm.logoPreview ? (
                              <img
                                src={editForm.logoPreview}
                                alt="Logo preview"
                                className="my-tenants-logo"
                              />
                            ) : null}
                            <input
                              id={`tenant-logo-${tenant.id}`}
                              type="file"
                              accept="image/*"
                              onChange={handleLogoChange}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="my-tenants-readonly-note">
                        Schema (<code>{slug || '—'}</code>) and domains are managed by the
                        platform and are not editable here.
                      </p>

                      <div className="my-tenants-edit-actions">
                        <button
                          type="submit"
                          className="my-tenants-btn is-primary"
                          disabled={busyId === tenant.id}
                        >
                          {busyId === tenant.id ? 'Saving…' : 'Save changes'}
                        </button>
                      </div>
                    </form>
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

export default MyTenantsPage
