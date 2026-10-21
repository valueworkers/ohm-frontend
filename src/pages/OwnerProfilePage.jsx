import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  getAuthSession,
  isAuthenticated,
  isSuperAdmin,
  saveAuthSession,
} from '../api/auth'
import {
  createOwner,
  deleteOwner,
  getOwnerMe,
  listOwners,
  updateOwner,
  updateOwnerMe,
} from '../api/owner'
import './OwnerProfilePage.css'

const EMPTY_CO_OWNER = {
  email: '',
  full_name: '',
  phone: '',
}

function OwnerProfilePage() {
  const session = getAuthSession()
  const canAccess = isAuthenticated() && !isSuperAdmin(session)

  const [meForm, setMeForm] = useState({
    email: '',
    full_name: '',
    phone: '',
  })
  const [coOwners, setCoOwners] = useState([])
  const [coOwnerForm, setCoOwnerForm] = useState(EMPTY_CO_OWNER)
  const [editingOwnerId, setEditingOwnerId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingMe, setIsSavingMe] = useState(false)
  const [isSavingOwner, setIsSavingOwner] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  async function loadProfile() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const [me, owners] = await Promise.all([getOwnerMe(), listOwners()])
      setMeForm({
        email: me?.email || '',
        full_name: me?.full_name || '',
        phone: me?.phone || '',
      })
      setCoOwners(owners)
    } catch (error) {
      setErrorMessage(error.message || 'Could not load profile.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!canAccess) return undefined
    loadProfile()
    return undefined
  }, [canAccess])

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (isSuperAdmin(session)) {
    return <Navigate to="/" replace />
  }

  async function handleSaveMe(event) {
    event.preventDefault()
    setIsSavingMe(true)
    setStatusMessage('')
    setErrorMessage('')
    try {
      const updated = await updateOwnerMe({
        email: meForm.email.trim(),
        full_name: meForm.full_name.trim(),
        phone: meForm.phone.trim(),
      })
      const current = getAuthSession()
      if (current) {
        saveAuthSession({
          message: current.message || '',
          user: {
            ...(current.user || {}),
            ...(updated || {}),
            email: updated?.email ?? meForm.email.trim(),
            full_name: updated?.full_name ?? meForm.full_name.trim(),
            phone: updated?.phone ?? meForm.phone.trim(),
            role: current.user?.role ?? null,
          },
          tokens: {
            access: current.access,
            refresh: current.refresh,
          },
          tenant: current.tenant || null,
          modules: current.modules || [],
        })
      }
      setStatusMessage('Profile updated.')
    } catch (error) {
      setErrorMessage(error.message || 'Could not update profile.')
    } finally {
      setIsSavingMe(false)
    }
  }

  function startEditOwner(owner) {
    setEditingOwnerId(owner.id)
    setCoOwnerForm({
      email: owner.email || '',
      full_name: owner.full_name || '',
      phone: owner.phone || '',
    })
    setStatusMessage('')
  }

  function resetCoOwnerForm() {
    setEditingOwnerId(null)
    setCoOwnerForm(EMPTY_CO_OWNER)
  }

  async function handleSaveCoOwner(event) {
    event.preventDefault()
    setIsSavingOwner(true)
    setStatusMessage('')
    setErrorMessage('')
    try {
      const payload = {
        email: coOwnerForm.email.trim(),
        full_name: coOwnerForm.full_name.trim(),
        phone: coOwnerForm.phone.trim(),
      }
      if (editingOwnerId) {
        await updateOwner(editingOwnerId, payload)
        setStatusMessage('Co-owner updated.')
      } else {
        await createOwner(payload)
        setStatusMessage('Co-owner added.')
      }
      resetCoOwnerForm()
      const owners = await listOwners()
      setCoOwners(owners)
    } catch (error) {
      setErrorMessage(error.message || 'Could not save co-owner.')
    } finally {
      setIsSavingOwner(false)
    }
  }

  async function handleDeleteOwner(ownerId) {
    setIsSavingOwner(true)
    setStatusMessage('')
    setErrorMessage('')
    try {
      await deleteOwner(ownerId)
      if (editingOwnerId === ownerId) resetCoOwnerForm()
      setStatusMessage('Co-owner removed.')
      const owners = await listOwners()
      setCoOwners(owners)
    } catch (error) {
      setErrorMessage(error.message || 'Could not remove co-owner.')
    } finally {
      setIsSavingOwner(false)
    }
  }

  return (
    <section className="owner-profile" aria-labelledby="owner-profile-title">
      <div className="owner-profile-inner">
        <header className="owner-profile-header">
          <p className="section-eyebrow">Owner</p>
          <h1 id="owner-profile-title">Profile</h1>
          <p className="owner-profile-lead">
            Update your details and manage co-owners.
          </p>
          <div className="owner-profile-actions" style={{ marginTop: '0.75rem' }}>
            <Link to="/my-tenants" className="owner-profile-btn">
              My tenants
            </Link>
          </div>
        </header>

        {isLoading ? (
          <p className="owner-profile-state" role="status">
            Loading profile…
          </p>
        ) : null}

        {errorMessage ? (
          <p className="owner-profile-state is-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {statusMessage ? (
          <p className="owner-profile-state" role="status">
            {statusMessage}
          </p>
        ) : null}

        {!isLoading ? (
          <>
            <article className="owner-profile-card">
              <h2>My details</h2>
              <form className="owner-profile-form" onSubmit={handleSaveMe}>
                <div className="owner-profile-field">
                  <label htmlFor="owner-full-name">Full name</label>
                  <input
                    id="owner-full-name"
                    value={meForm.full_name}
                    onChange={(event) =>
                      setMeForm((prev) => ({ ...prev, full_name: event.target.value }))
                    }
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="owner-profile-field">
                  <label htmlFor="owner-email">Email</label>
                  <input
                    id="owner-email"
                    type="email"
                    value={meForm.email}
                    onChange={(event) =>
                      setMeForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="owner-profile-field">
                  <label htmlFor="owner-phone">Phone</label>
                  <input
                    id="owner-phone"
                    type="tel"
                    value={meForm.phone}
                    onChange={(event) =>
                      setMeForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    autoComplete="tel"
                  />
                </div>
                <div className="owner-profile-actions">
                  <button
                    type="submit"
                    className="owner-profile-btn is-primary"
                    disabled={isSavingMe}
                  >
                    {isSavingMe ? 'Saving…' : 'Save profile'}
                  </button>
                </div>
              </form>
            </article>

            <article className="owner-profile-card">
              <h2>Co-owners</h2>

              {coOwners.length === 0 ? (
                <p className="owner-profile-state">No co-owners yet.</p>
              ) : (
                <ul className="owner-profile-list">
                  {coOwners.map((owner) => (
                    <li key={owner.id || owner.email} className="owner-profile-item">
                      <div className="owner-profile-item-top">
                        <div>
                          <strong>{owner.full_name || owner.email}</strong>
                          <p>{owner.email}</p>
                          {owner.phone ? <p>{owner.phone}</p> : null}
                        </div>
                        <div className="owner-profile-actions">
                          <button
                            type="button"
                            className="owner-profile-btn"
                            onClick={() => startEditOwner(owner)}
                          >
                            Edit
                          </button>
                          {owner.id ? (
                            <button
                              type="button"
                              className="owner-profile-btn"
                              disabled={isSavingOwner}
                              onClick={() => handleDeleteOwner(owner.id)}
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form
                className="owner-profile-form"
                style={{ marginTop: '1rem' }}
                onSubmit={handleSaveCoOwner}
              >
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                  {editingOwnerId ? 'Edit co-owner' : 'Add co-owner'}
                </h3>
                <div className="owner-profile-field">
                  <label htmlFor="co-owner-full-name">Full name</label>
                  <input
                    id="co-owner-full-name"
                    value={coOwnerForm.full_name}
                    onChange={(event) =>
                      setCoOwnerForm((prev) => ({
                        ...prev,
                        full_name: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="owner-profile-field">
                  <label htmlFor="co-owner-email">Email</label>
                  <input
                    id="co-owner-email"
                    type="email"
                    value={coOwnerForm.email}
                    onChange={(event) =>
                      setCoOwnerForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="owner-profile-field">
                  <label htmlFor="co-owner-phone">Phone</label>
                  <input
                    id="co-owner-phone"
                    type="tel"
                    value={coOwnerForm.phone}
                    onChange={(event) =>
                      setCoOwnerForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                  />
                </div>
                <div className="owner-profile-actions">
                  <button
                    type="submit"
                    className="owner-profile-btn is-primary"
                    disabled={isSavingOwner}
                  >
                    {isSavingOwner
                      ? 'Saving…'
                      : editingOwnerId
                        ? 'Update co-owner'
                        : 'Add co-owner'}
                  </button>
                  {editingOwnerId ? (
                    <button
                      type="button"
                      className="owner-profile-btn"
                      onClick={resetCoOwnerForm}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </article>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default OwnerProfilePage
