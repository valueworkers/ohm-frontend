import { apiRequest } from '../../api/client'
import { writeAuthSession } from '../../api/session'
import { getTenantHeaders, resolveCurrentTenantSlug } from '../../utils/tenantHeader'

function tenantRequest(path, options = {}) {
  const slug = resolveCurrentTenantSlug()
  if (!slug) {
    throw new Error('Tenant slug is missing. Open the site from My tenants first.')
  }

  return apiRequest(path, {
    ...options,
    headers: {
      ...getTenantHeaders(slug),
      ...options.headers,
    },
  })
}

export async function tenantLoginWithPassword({ username, password }) {
  return tenantRequest('api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      method: 'password',
      password,
    }),
  })
}

export async function tenantRequestLoginOtp({ username }) {
  return tenantRequest('api/auth/otp/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      purpose: 'login',
    }),
  })
}

export async function tenantLoginWithOtp({ username, otp }) {
  return tenantRequest('api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      method: 'otp',
      otp,
    }),
  })
}

export async function tenantRequestPasswordResetOtp({ username }) {
  return tenantRequest('api/auth/otp/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      purpose: 'password_reset',
    }),
  })
}

export async function tenantResetPassword({ username, otp, newPassword }) {
  return tenantRequest('api/auth/password-reset/', {
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

/** Persist tokens for both platform session + template localStorage keys. */
export function saveTenantAuthSession(payload) {
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

  const rawUser = payload?.user ?? null
  const role =
    rawUser?.primary_role ?? rawUser?.role ?? rawUser?.user_type ?? null
  const user = rawUser
    ? {
        ...rawUser,
        role,
        primary_role: rawUser.primary_role ?? role,
        full_name: buildDisplayName(rawUser),
      }
    : null

  writeAuthSession({
    message: payload?.message || '',
    schema_name: payload?.schema_name || null,
    user,
    access,
    refresh,
    tenant: {
      slug: resolveCurrentTenantSlug(),
    },
  })

  if (access) localStorage.setItem('access_token', access)
  if (refresh) localStorage.setItem('refresh_token', refresh)
  if (user) localStorage.setItem('authUser', JSON.stringify(user))
  if (role) {
    localStorage.setItem('user_type', String(role))
  }
  localStorage.setItem(
    'authTokens',
    JSON.stringify({
      access_token: access,
      refresh_token: refresh,
    })
  )

  window.dispatchEvent(new Event('auth-changed'))
  return { user, access, refresh }
}

export function isTenantAuthenticated() {
  return Boolean(
    localStorage.getItem('access_token') || localStorage.getItem('authUser')
  )
}
