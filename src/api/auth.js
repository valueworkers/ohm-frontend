import { apiRequest } from './client'
import {
  clearAuthStorage,
  readAuthSession,
  writeAuthSession,
} from './session'

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

  const session = {
    message: payload?.message || '',
    user: payload?.user ?? null,
    access,
    refresh,
  }

  writeAuthSession(session)
  return session
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
