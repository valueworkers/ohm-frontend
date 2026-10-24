import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  createOwner,
  deleteOwner,
  listOwners,
  updateOwner,
} from '../../api/owner'
import { isTenantAuthenticated } from '../api/tenantAuth'

const EMPTY = { email: '', full_name: '', phone: '' }

function CoOwners({ embedded = false }) {
  const canAccess = isTenantAuthenticated()
  const [owners, setOwners] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  async function loadOwners() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      setOwners(await listOwners())
    } catch (error) {
      setOwners([])
      setErrorMessage(error.message || 'Could not load co-owners.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!canAccess) return undefined
    loadOwners()
    return undefined
  }, [canAccess])

  if (!canAccess && !embedded) {
    return <Navigate to="/login" replace />
  }

  function startEdit(owner) {
    setEditingId(owner.id)
    setForm({
      email: owner.email || '',
      full_name: owner.full_name || '',
      phone: owner.phone || '',
    })
    setStatusMessage('')
  }

  function resetForm() {
    setEditingId(null)
    setForm(EMPTY)
  }

  async function handleSave(event) {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    setStatusMessage('')
    try {
      const payload = {
        email: form.email.trim(),
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
      }
      if (editingId) {
        await updateOwner(editingId, payload)
        setStatusMessage('Co-owner updated.')
      } else {
        await createOwner(payload)
        setStatusMessage('Co-owner added.')
      }
      resetForm()
      await loadOwners()
    } catch (error) {
      setErrorMessage(error.message || 'Could not save co-owner.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(ownerId) {
    setIsSaving(true)
    setErrorMessage('')
    try {
      await deleteOwner(ownerId)
      if (editingId === ownerId) resetForm()
      setStatusMessage('Co-owner removed.')
      await loadOwners()
    } catch (error) {
      setErrorMessage(error.message || 'Could not remove co-owner.')
    } finally {
      setIsSaving(false)
    }
  }

  const content = (
    <>
      {isLoading ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Loading co-owners…
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

      {!isLoading && owners.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          No co-owners yet.
        </p>
      ) : null}

      {owners.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {owners.map((owner) => (
            <li
              key={owner.id || owner.email}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {owner.full_name || owner.email}
                  </p>
                  <p className="text-sm text-slate-500">{owner.email}</p>
                  {owner.phone ? (
                    <p className="text-sm text-slate-500">{owner.phone}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => startEdit(owner)}
                  >
                    Edit
                  </button>
                  {owner.id ? (
                    <button
                      type="button"
                      disabled={isSaving}
                      className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                      onClick={() => handleDelete(owner.id)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <form
        onSubmit={handleSave}
        className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-base font-semibold text-slate-900">
          {editingId ? 'Edit co-owner' : 'Add co-owner'}
        </h2>
        <div>
          <label htmlFor="co-full-name" className="block text-sm font-semibold text-slate-800">
            Full name
          </label>
          <input
            id="co-full-name"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            value={form.full_name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, full_name: event.target.value }))
            }
            required
          />
        </div>
        <div>
          <label htmlFor="co-email" className="block text-sm font-semibold text-slate-800">
            Email
          </label>
          <input
            id="co-email"
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
          <label htmlFor="co-phone" className="block text-sm font-semibold text-slate-800">
            Phone
          </label>
          <input
            id="co-phone"
            type="tel"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            value={form.phone}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, phone: event.target.value }))
            }
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : editingId ? 'Update co-owner' : 'Add co-owner'}
          </button>
          {editingId ? (
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={resetForm}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </>
  )

  if (embedded) return content

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
        Account
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Co-owners</h1>
      <p className="mt-2 text-sm text-slate-600">
        Add or edit co-owners for this organization.
      </p>
      <div className="mt-6">{content}</div>
    </div>
  )
}

export default CoOwners
