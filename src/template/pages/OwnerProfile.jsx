import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getOwnerMe, updateOwnerMe } from '../../api/owner'
import {
  isTenantAuthenticated,
  saveTenantAuthSession,
} from '../api/tenantAuth'
import { getAuthSession } from '../../api/auth'

function OwnerProfile({ embedded = false }) {
  const canAccess = isTenantAuthenticated()
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (!canAccess) return undefined
    let cancelled = false

    getOwnerMe()
      .then((me) => {
        if (cancelled) return
        setForm({
          email: me?.email || '',
          full_name: me?.full_name || '',
          phone: me?.phone || '',
        })
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(error.message || 'Could not load profile.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [canAccess])

  if (!canAccess && !embedded) {
    return <Navigate to="/login" replace />
  }

  async function handleSave(event) {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    setStatusMessage('')
    try {
      const updated = await updateOwnerMe({
        email: form.email.trim(),
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
      })
      const current = getAuthSession()
      saveTenantAuthSession({
        user: {
          ...(current?.user || {}),
          ...(updated || {}),
          email: updated?.email ?? form.email.trim(),
          full_name: updated?.full_name ?? form.full_name.trim(),
          phone: updated?.phone ?? form.phone.trim(),
        },
        tokens: {
          access: current?.access || localStorage.getItem('access_token'),
          refresh: current?.refresh || localStorage.getItem('refresh_token'),
        },
      })
      setStatusMessage('Profile updated.')
    } catch (error) {
      setErrorMessage(error.message || 'Could not update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const content = (
    <>
      {isLoading ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Loading profile…
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800" role="status">
          {statusMessage}
        </p>
      ) : null}

      {!isLoading ? (
        <form
          onSubmit={handleSave}
          className={`${embedded ? '' : 'mt-6 '}space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm`}
        >
          <div>
            <label htmlFor="owner-full-name" className="block text-sm font-semibold text-slate-800">
              Full name
            </label>
            <input
              id="owner-full-name"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={form.full_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, full_name: event.target.value }))
              }
              required
            />
          </div>
          <div>
            <label htmlFor="owner-email" className="block text-sm font-semibold text-slate-800">
              Email
            </label>
            <input
              id="owner-email"
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
          </div>
          <div>
            <label htmlFor="owner-phone" className="block text-sm font-semibold text-slate-800">
              Phone
            </label>
            <input
              id="owner-phone"
              type="tel"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      ) : null}
    </>
  )

  if (embedded) return content

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
        Account
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mt-2 text-sm text-slate-600">
        Update your owner details for this tenant site.
      </p>
      <div className="mt-6">{content}</div>
    </div>
  )
}

export default OwnerProfile
