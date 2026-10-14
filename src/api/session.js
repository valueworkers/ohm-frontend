const AUTH_STORAGE_KEY = 'ohm_auth'
export const SESSION_EVENT = 'ohm:session-changed'
export const FORCE_LOGOUT_EVENT = 'ohm:force-logout'

export function readAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeAuthSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event(SESSION_EVENT))
}

export function clearAuthStorage() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  window.dispatchEvent(new Event(SESSION_EVENT))
}

export function forceLogoutAndRedirect() {
  clearAuthStorage()
  window.dispatchEvent(new Event(FORCE_LOGOUT_EVENT))
}
