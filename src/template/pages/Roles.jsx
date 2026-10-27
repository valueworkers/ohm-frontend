import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isTenantAuthenticated } from '../api/tenantAuth'
import {
  createRole,
  deleteRole,
  listPermissions,
  listRoles,
  updateRole,
} from '../api/rolesApi'

function permissionId(item) {
  if (typeof item === 'number' && Number.isFinite(item)) return item
  if (typeof item === 'string' && /^\d+$/.test(item.trim())) {
    return Number(item.trim())
  }
  const id = item?.id ?? item?.permission_id
  const num = Number(id)
  return Number.isFinite(num) ? num : null
}

function rolePermissionList(role) {
  if (Array.isArray(role?.permission_details)) return role.permission_details
  if (Array.isArray(role?.permissions)) return role.permissions
  return []
}

function rolePermissionIds(role) {
  return rolePermissionList(role)
    .map(permissionId)
    .filter((id) => id != null)
}

function Roles({ embedded = false }) {
  const canAccess = isTenantAuthenticated()
  const formPanelRef = useRef(null)
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    code: '',
    name: '',
    rank: 30,
    permissions: [],
  })

  const permissionOptions = useMemo(
    () =>
      permissions
        .map((item) => {
          const id = permissionId(item)
          if (id == null) return null
          return {
            id,
            label:
              item?.name ||
              item?.label ||
              item?.code ||
              item?.key ||
              `Permission ${id}`,
          }
        })
        .filter(Boolean),
    [permissions]
  )

  async function loadData() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const [roleList, permissionList] = await Promise.all([
        listRoles(),
        listPermissions(),
      ])
      setRoles(roleList)
      setPermissions(permissionList)
    } catch (error) {
      setErrorMessage(error.message || 'Could not load roles.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!canAccess) return undefined
    loadData()
    return undefined
  }, [canAccess])

  if (!canAccess && !embedded) {
    return <Navigate to="/login" replace />
  }

  function resetForm() {
    setEditingId(null)
    setForm({
      code: '',
      name: '',
      rank: 30,
      permissions: [],
    })
  }

  function startEdit(role) {
    setEditingId(role.id)
    setForm({
      code: role.code || '',
      name: role.name || '',
      rank: role.rank ?? 30,
      permissions: rolePermissionIds(role),
    })
    setStatusMessage('')
    window.requestAnimationFrame(() => {
      formPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      const nameInput = formPanelRef.current?.querySelector('#role-name')
      if (nameInput instanceof HTMLElement) nameInput.focus({ preventScroll: true })
    })
  }

  function togglePermission(id) {
    setForm((prev) => {
      const has = prev.permissions.includes(id)
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((item) => item !== id)
          : [...prev.permissions, id],
      }
    })
  }

  function selectAllPermissions() {
    setForm((prev) => ({
      ...prev,
      permissions: permissionOptions.map((item) => item.id),
    }))
  }

  function deselectAllPermissions() {
    setForm((prev) => ({
      ...prev,
      permissions: [],
    }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    setStatusMessage('')
    try {
      if (editingId) {
        await updateRole(editingId, {
          name: form.name,
          rank: form.rank,
          permissions: form.permissions,
        })
        setStatusMessage('Role updated.')
      } else {
        await createRole(form)
        setStatusMessage('Role created.')
      }
      resetForm()
      await loadData()
    } catch (error) {
      setErrorMessage(error.message || 'Could not save role.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(roleId) {
    if (!window.confirm('Delete this custom role? Remove its assignments first.')) {
      return
    }
    setIsSaving(true)
    setErrorMessage('')
    try {
      await deleteRole(roleId)
      if (editingId === roleId) resetForm()
      setStatusMessage('Role deleted.')
      await loadData()
    } catch (error) {
      setErrorMessage(error.message || 'Could not delete role.')
    } finally {
      setIsSaving(false)
    }
  }

  const content = (
    <>
      {isLoading ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Loading roles…
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

      {!isLoading && roles.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          No roles yet. Create one below.
        </p>
      ) : null}

      {roles.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {roles.map((role) => {
            const details = rolePermissionList(role)
            return (
              <li
                key={role.id || role.code}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">
                      {role.name || role.code}
                    </p>
                    <p className="text-sm text-slate-500">
                      Code: {role.code || '—'} · Rank: {role.rank ?? '—'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {details.length} permission(s)
                    </p>
                    {details.length > 0 ? (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {details.slice(0, 8).map((item) => (
                          <li
                            key={permissionId(item) ?? item.code}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                          >
                            {item.name || item.code || `Permission ${item.id}`}
                          </li>
                        ))}
                        {details.length > 8 ? (
                          <li className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                            +{details.length - 8} more
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => startEdit(role)}
                    >
                      Edit
                    </button>
                    {role.id ? (
                      <button
                        type="button"
                        disabled={isSaving}
                        className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                        onClick={() => handleDelete(role.id)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}

      <form
        ref={formPanelRef}
        onSubmit={handleSave}
        className="mt-4 scroll-mt-24 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-base font-semibold text-slate-900">
          {editingId ? 'Edit role' : 'Create role'}
        </h2>

        {editingId ? (
          <div>
            <p className="block text-sm font-semibold text-slate-800">Code</p>
            <p className="mt-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
              {form.code || '—'}
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="role-code" className="block text-sm font-semibold text-slate-800">
              Code
            </label>
            <input
              id="role-code"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={form.code}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))
              }
              placeholder="AUDITOR_DEMO"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="role-name" className="block text-sm font-semibold text-slate-800">
            Name
          </label>
          <input
            id="role-name"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            required
          />
        </div>

        <div>
          <label htmlFor="role-rank" className="block text-sm font-semibold text-slate-800">
            Rank
          </label>
          <input
            id="role-rank"
            type="number"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            value={form.rank}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, rank: Number(event.target.value) }))
            }
            required
          />
        </div>

        <fieldset>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <legend className="text-sm font-semibold text-slate-800">Permissions</legend>
            {permissionOptions.length > 0 ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={selectAllPermissions}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={deselectAllPermissions}
                >
                  Deselect all
                </button>
              </div>
            ) : null}
          </div>
          {permissionOptions.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No permissions returned by the API.</p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {permissionOptions.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(item.id)}
                    onChange={() => togglePermission(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : editingId ? 'Update role' : 'Create role'}
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
        Access
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Roles</h1>
      <p className="mt-2 text-sm text-slate-600">
        Create and manage custom roles for this tenant workspace.
      </p>
      <div className="mt-6">{content}</div>
    </div>
  )
}

export default Roles
