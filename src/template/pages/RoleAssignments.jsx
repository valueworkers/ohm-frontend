import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { listOwners } from '../../api/owner'
import { isTenantAuthenticated } from '../api/tenantAuth'
import {
  createRoleAssignment,
  deleteRoleAssignment,
  listRoleAssignments,
  listRoles,
} from '../api/rolesApi'

function RoleAssignments({ embedded = false }) {
  const canAccess = isTenantAuthenticated()
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [form, setForm] = useState({
    user_id: '',
    role_id: '',
    object_type: 'booking.venue',
    object_id: 1,
  })

  async function loadBase() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const [roleList, ownerList] = await Promise.all([listRoles(), listOwners()])
      setRoles(roleList)
      setUsers(ownerList)
      const firstUserId =
        ownerList[0]?.id != null ? String(ownerList[0].id) : ''
      setSelectedUserId((prev) => prev || firstUserId)
      setForm((prev) => ({
        ...prev,
        user_id: prev.user_id || firstUserId,
        role_id: prev.role_id || (roleList[0]?.id != null ? String(roleList[0].id) : ''),
      }))
    } catch (error) {
      setErrorMessage(error.message || 'Could not load assignment data.')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadAssignments(userId) {
    if (!userId) {
      setAssignments([])
      return
    }
    setErrorMessage('')
    try {
      setAssignments(await listRoleAssignments(userId))
    } catch (error) {
      setAssignments([])
      setErrorMessage(error.message || 'Could not load role assignments.')
    }
  }

  useEffect(() => {
    if (!canAccess) return undefined
    loadBase()
    return undefined
  }, [canAccess])

  useEffect(() => {
    if (!canAccess || !selectedUserId) return undefined
    loadAssignments(selectedUserId)
    return undefined
  }, [canAccess, selectedUserId])

  if (!canAccess && !embedded) {
    return <Navigate to="/login" replace />
  }

  async function handleAssign(event) {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    setStatusMessage('')
    try {
      await createRoleAssignment(form)
      setStatusMessage('Role assigned.')
      setSelectedUserId(String(form.user_id))
      await loadAssignments(form.user_id)
    } catch (error) {
      setErrorMessage(error.message || 'Could not assign role.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRevoke(assignmentId) {
    if (!window.confirm('Revoke this role assignment?')) return
    setIsSaving(true)
    setErrorMessage('')
    try {
      await deleteRoleAssignment(assignmentId)
      setStatusMessage('Assignment revoked.')
      await loadAssignments(selectedUserId)
    } catch (error) {
      setErrorMessage(error.message || 'Could not revoke assignment.')
    } finally {
      setIsSaving(false)
    }
  }

  const content = (
    <>
      {isLoading ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Loading…
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

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor="assignment-user-filter" className="block text-sm font-semibold text-slate-800">
          View assignments for user
        </label>
        <select
          id="assignment-user-filter"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          value={selectedUserId}
          onChange={(event) => setSelectedUserId(event.target.value)}
        >
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user.id || user.email} value={String(user.id)}>
              {user.full_name || user.email} ({user.id})
            </option>
          ))}
        </select>

        {!selectedUserId ? (
          <p className="mt-4 text-sm text-slate-500">Choose a user to list assignments.</p>
        ) : assignments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No assignments for this user.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {assignments.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 px-3 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.role?.name || item.role_name || `Role ${item.role_id}`}
                  </p>
                  <p className="text-sm text-slate-500">
                    {item.object_type || '—'} #{item.object_id ?? '—'}
                  </p>
                </div>
                {item.id ? (
                  <button
                    type="button"
                    disabled={isSaving}
                    className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    onClick={() => handleRevoke(item.id)}
                  >
                    Revoke
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        onSubmit={handleAssign}
        className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-base font-semibold text-slate-900">Assign role</h2>

        <div>
          <label htmlFor="assign-user" className="block text-sm font-semibold text-slate-800">
            User
          </label>
          <select
            id="assign-user"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            value={form.user_id}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, user_id: event.target.value }))
            }
            required
          >
            <option value="">Select user</option>
            {users.map((user) => (
              <option key={user.id || user.email} value={String(user.id)}>
                {user.full_name || user.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="assign-role" className="block text-sm font-semibold text-slate-800">
            Role
          </label>
          <select
            id="assign-role"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            value={form.role_id}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, role_id: event.target.value }))
            }
            required
          >
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id || role.code} value={String(role.id)}>
                {role.name || role.code}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="assign-object-type" className="block text-sm font-semibold text-slate-800">
            Object type
          </label>
          <input
            id="assign-object-type"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            value={form.object_type}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, object_type: event.target.value }))
            }
            placeholder="booking.venue"
            required
          />
        </div>

        <div>
          <label htmlFor="assign-object-id" className="block text-sm font-semibold text-slate-800">
            Object ID
          </label>
          <input
            id="assign-object-id"
            type="number"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            value={form.object_id}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, object_id: Number(event.target.value) }))
            }
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {isSaving ? 'Assigning…' : 'Assign role'}
        </button>
      </form>
    </>
  )

  if (embedded) return content

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
        Access
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Role assignments</h1>
      <p className="mt-2 text-sm text-slate-600">
        Assign roles to users on objects within this tenant.
      </p>
      <div className="mt-6">{content}</div>
    </div>
  )
}

export default RoleAssignments
