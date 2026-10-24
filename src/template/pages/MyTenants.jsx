import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  activateMyTenant,
  listMyTenants,
  updateMyTenant,
} from '../../api/myTenants'
import { isTenantAuthenticated } from '../api/tenantAuth'
import {
  getTenantPrimaryDomain,
  getTenantSlug,
  navigateToTenantSite,
} from '../../utils/tenantSite'

function formatStatus(status) {
  if (!status) return 'Unknown'
  return String(status).replace(/_/g, ' ')
}

function MyTenants({ embedded = false }) {
  const canAccess = isTenantAuthenticated()
  const [tenants, setTenants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    timezone: 'Asia/Kolkata',
    default_currency: 'INR',
  })

  async function loadTenants() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      setTenants(await listMyTenants())
    } catch (error) {
      setTenants([])
      setErrorMessage(error.message || 'Could not load tenants.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!canAccess) return undefined
    loadTenants()
    return undefined
  }, [canAccess])

  if (!canAccess && !embedded) {
    return <Navigate to="/login" replace />
  }

  function startEdit(tenant) {
    setEditingId(tenant.id)
    setEditForm({
      name: tenant.name || '',
      contact_email: tenant.contact_email || '',
      contact_phone: tenant.contact_phone || '',
      timezone: tenant.timezone || 'Asia/Kolkata',
      default_currency: tenant.default_currency || 'INR',
    })
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!editingId) return
    setBusyId(editingId)
    setActionMessage('')
    try {
      await updateMyTenant(editingId, editForm)
      setEditingId(null)
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
    try {
      await activateMyTenant(tenant.id)
      await loadTenants()
      setActionMessage('Tenant activated.')
      navigateToTenantSite({ ...tenant, status: 'active' })
    } catch (error) {
      setActionMessage(error.message || 'Could not activate tenant.')
    } finally {
      setBusyId(null)
    }
  }

  const content = (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={loadTenants}
          className="inline-flex min-h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Loading tenants…
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {actionMessage ? (
        <p className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800" role="status">
          {actionMessage}
        </p>
      ) : null}

      {!isLoading && tenants.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          No tenants found.
        </p>
      ) : null}

      <ul className="mt-4 space-y-4">
        {tenants.map((tenant) => {
          const domain = getTenantPrimaryDomain(tenant)
          const slug = getTenantSlug(tenant)
          const status = String(tenant.status || '').toLowerCase()
          const isActive = status === 'active'

          return (
            <li
              key={tenant.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {tenant.name || `Tenant ${tenant.id}`}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {domain || (slug ? `${slug}.o-hm.com` : 'No domain')}
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold capitalize text-teal-800">
                  {formatStatus(tenant.status)}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Email
                  </dt>
                  <dd className="text-slate-800">{tenant.contact_email || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Phone
                  </dt>
                  <dd className="text-slate-800">{tenant.contact_phone || '—'}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                {isActive ? (
                  <button
                    type="button"
                    className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                    onClick={() => navigateToTenantSite(tenant)}
                  >
                    Open {domain || 'site'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === tenant.id}
                    className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                    onClick={() => handleActivate(tenant)}
                  >
                    {busyId === tenant.id ? 'Activating…' : 'Activate'}
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() =>
                    editingId === tenant.id ? setEditingId(null) : startEdit(tenant)
                  }
                >
                  {editingId === tenant.id ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editingId === tenant.id ? (
                <form onSubmit={handleSave} className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
                  <input
                    className="rounded-xl border border-slate-200 px-3 py-2.5"
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Name"
                    required
                  />
                  <input
                    className="rounded-xl border border-slate-200 px-3 py-2.5"
                    type="email"
                    value={editForm.contact_email}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        contact_email: event.target.value,
                      }))
                    }
                    placeholder="Contact email"
                  />
                  <input
                    className="rounded-xl border border-slate-200 px-3 py-2.5"
                    value={editForm.contact_phone}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        contact_phone: event.target.value,
                      }))
                    }
                    placeholder="Contact phone"
                  />
                  <button
                    type="submit"
                    disabled={busyId === tenant.id}
                    className="justify-self-start rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                  >
                    {busyId === tenant.id ? 'Saving…' : 'Save changes'}
                  </button>
                </form>
              ) : null}
            </li>
          )
        })}
      </ul>
    </>
  )

  if (embedded) return content

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
        Account
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">My tenants</h1>
      <p className="mt-2 text-sm text-slate-600">
        Manage your organizations on this account.
      </p>
      <div className="mt-6">{content}</div>
    </div>
  )
}

export default MyTenants
