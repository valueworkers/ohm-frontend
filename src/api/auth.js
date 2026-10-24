import { apiRequest } from './client'
import {
  clearAuthStorage,
  readAuthSession,
  writeAuthSession,
} from './session'
import {
  buildTenantBasePath,
  extractTenantFromAuthPayload,
  writeTenantProfile,
} from '../template/tenantContext'

export async function loginWithPassword({ username, password }) {
  return apiRequest('api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      method: 'password',
      password,
    }),
  })
}

export async function requestLoginOtp({ username }) {
  return apiRequest('api/auth/otp/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      purpose: 'login',
    }),
  })
}

export async function loginWithOtp({ username, otp }) {
  return apiRequest('api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      method: 'otp',
      otp,
    }),
  })
}

export async function requestPasswordResetOtp({ username }) {
  return apiRequest('api/auth/otp/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      purpose: 'password_reset',
    }),
  })
}

export async function resetPassword({ username, otp, newPassword }) {
  return apiRequest('api/auth/password-reset/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      otp,
      new_password: newPassword,
    }),
  })
}

function buildDisplayName(user) {
  if (!user || typeof user !== 'object') return ''
  const full = String(user.full_name || '').trim()
  if (full) return full
  return [user.first_name, user.middle_name, user.last_name]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ')
}

function normalizeUser(user) {
  if (!user || typeof user !== 'object') return null
  const role =
    user.primary_role ?? user.role ?? user.user_type ?? null
  return {
    ...user,
    role,
    primary_role: user.primary_role ?? role,
    full_name: buildDisplayName(user),
  }
}

export function saveAuthSession(payload) {
  const access =
    payload?.tokens?.access ||
    payload?.access ||
    payload?.token ||
    payload?.access_token ||
    null

  const refresh =
    payload?.tokens?.refresh ||
    payload?.refresh ||
    payload?.refresh_token ||
    null

  const tenant = extractTenantFromAuthPayload(payload)
  const user = normalizeUser(payload?.user)

  const session = {
    message: payload?.message || '',
    schema_name: payload?.schema_name || null,
    user,
    access,
    refresh,
    tenant,
    modules: tenant?.modules || payload?.modules || [],
  }

  writeAuthSession(session)

  if (tenant) {
    writeTenantProfile(tenant)
  }

  return session
}

export function getTenantTemplatePath(payloadOrSession) {
  const tenant =
    payloadOrSession?.tenant ||
    extractTenantFromAuthPayload(payloadOrSession)
  if (!tenant) return null
  const base = buildTenantBasePath(tenant.slug, tenant.tenantId)
  return base ? `${base}/` : null
}

export function redirectToTenantTemplate(payloadOrSession) {
  const path = getTenantTemplatePath(payloadOrSession)
  if (!path) return false
  window.location.assign(path)
  return true
}

export function clearAuthSession() {
  clearAuthStorage()
}

export function getAuthSession() {
  return readAuthSession()
}

export function getAccessToken() {
  return getAuthSession()?.access || null
}

export function isAuthenticated() {
  return Boolean(getAccessToken())
}

/** Normalize API role labels: "Super Admin" → "SUPER_ADMIN". */
export function normalizeRoleCode(role) {
  if (role == null || role === '') return null
  return String(role)
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase()
}

export function getUserRole(sessionOrUser = getAuthSession()) {
  const user = sessionOrUser?.user ?? sessionOrUser
  const role =
    user?.primary_role ?? user?.role ?? user?.user_type ?? null
  return normalizeRoleCode(role)
}

export function isSuperAdmin(sessionOrUser = getAuthSession()) {
  const code = getUserRole(sessionOrUser)
  return code === 'SUPER_ADMIN' || code === 'SUPERADMIN'
}

/** Where to send the user after a successful platform login. */
export function getPostLoginPath(sessionOrPayload = getAuthSession()) {
  const tenantPath = getTenantTemplatePath(sessionOrPayload)
  if (tenantPath) return tenantPath

  if (isSuperAdmin(sessionOrPayload)) return '/'

  const role = getUserRole(sessionOrPayload)
  if (role == null) return '/my-tenants'

  return '/'
}

export function redirectAfterLogin(sessionOrPayload) {
  const path = getPostLoginPath(sessionOrPayload)
  if (!path) return false

  if (path.startsWith('/t/')) {
    window.location.assign(path)
    return true
  }

  return false
}

/**
 * After login routing. Tenant owners (role null) go to /my-tenants
 * and choose when to open their site.
 */
export async function completeOwnerLogin(sessionOrPayload) {
  if (redirectAfterLogin(sessionOrPayload)) {
    return { redirected: true, path: null }
  }

  return { redirected: false, path: getPostLoginPath(sessionOrPayload) }
}
