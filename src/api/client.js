import { forceLogoutAndRedirect, readAuthSession } from './session'

function getBaseUrl() {
  const raw = import.meta.env.VITE_BASEURL_CARE ?? ''
  return String(raw).replace(/^["']|["']$/g, '').replace(/\/?$/, '/')
}

const FIELD_LABELS = {
  organization_name: 'Organization name',
  email: 'Email',
  contact_phone: 'Phone number',
  branches: 'Branches',
  slug: 'Subdomain',
  address: 'Address',
  custom_domain: 'Domain',
  ops_admin_email: 'Ops admin email',
}

function pickRawMessage(data) {
  if (!data) return ''
  if (typeof data === 'string') return data

  const primary = data.detail || data.message || data.error || data.non_field_errors
  if (primary) {
    return Array.isArray(primary) ? primary[0] : String(primary)
  }

  const firstEntry = Object.entries(data).find(
    ([, value]) => typeof value === 'string' || Array.isArray(value)
  )
  if (!firstEntry) return ''

  const [field, value] = firstEntry
  const message = Array.isArray(value) ? String(value[0] || '') : String(value)
  const label = FIELD_LABELS[field]
  if (!message) return ''
  if (label && /may not be blank|may not be null|required/i.test(message)) {
    return `${label} is required.`
  }
  return label ? `${label}: ${message}` : message
}

function shortenMessage(raw, maxLength = 48) {
  let text = String(raw || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return ''
  // Ignore HTML / stack-style bodies from the API
  if (/<!DOCTYPE|<\/?[a-z][\s\S]*>/i.test(String(raw)) || text.length > 200) {
    return ''
  }

  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trim()}…`
}

function formatThrottleMessage(raw) {
  const text = String(raw || '')
  const match = text.match(/available in\s+(\d+)\s+seconds?/i)
  if (!match && !/throttl/i.test(text)) return ''

  const seconds = match ? Number(match[1]) : 0
  if (!seconds || Number.isNaN(seconds)) {
    return 'Too many requests. Please try again later.'
  }

  const minutes = Math.max(1, Math.ceil(seconds / 60))
  return `Too many requests. Please try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`
}

function getErrorMessage(data, status, path = '') {
  const authEndpoint = isAuthEndpoint(path)
  const raw = pickRawMessage(data)
  const throttleMessage = formatThrottleMessage(raw)
  if (status === 429 || throttleMessage) {
    return throttleMessage || 'Too many requests. Please try again later.'
  }

  const short = shortenMessage(raw)

  if (status === 400) return short || 'Invalid request. Check your details.'
  if (status === 401) {
    if (authEndpoint) return short || 'Invalid email or password.'
    return 'Session expired. Please sign in again.'
  }
  if (status === 403) return 'You do not have permission.'
  if (status === 404) return 'Not found.'
  if (status === 409) return short || 'Already exists.'
  if (status === 422) return short || 'Please check the form.'
  if (status >= 500) return 'Something went wrong. Try again later.'

  return short || 'Request failed. Please try again.'
}

function isAuthEndpoint(path) {
  return (
    path.includes('api/auth/login') ||
    path.includes('api/auth/otp') ||
    path.includes('api/auth/password-reset') ||
    path.includes('api/auth/token')
  )
}

function isAuthRelatedMessage(message) {
  const text = String(message || '').toLowerCase()
  return (
    text.includes('token') ||
    text.includes('unauthorized') ||
    text.includes('authentication') ||
    text.includes('not authenticated') ||
    text.includes('authentication credentials') ||
    text.includes('invalid token') ||
    text.includes('expired token') ||
    text.includes('token expired') ||
    text.includes('token not valid')
  )
}

function shouldForceLogout({ path, status, message }) {
  if (isAuthEndpoint(path)) return false
  if (!readAuthSession()?.access) return false

  if (status === 401) return true
  if (status >= 500) return false
  if (status && status !== 401 && status !== 403) return false

  if (status === 403 && isAuthRelatedMessage(message)) return true
  return false
}

export async function apiRequest(path, options = {}) {
  const { auth = false, headers: customHeaders, ...rest } = options
  const cleanPath = path.replace(/^\//, '')
  const url = `${getBaseUrl()}${cleanPath}`
  const isFormData =
    typeof FormData !== 'undefined' && rest.body instanceof FormData
  const headers = {
    Accept: 'application/json',
    ...customHeaders,
  }

  // Let the browser set multipart boundary for FormData
  if (!isFormData && headers['Content-Type'] == null) {
    headers['Content-Type'] = 'application/json'
  }
  if (isFormData) {
    delete headers['Content-Type']
  }

  if (auth) {
    const access = readAuthSession()?.access
    if (access) headers.Authorization = `Bearer ${access}`
  }

  let response
  try {
    response = await fetch(url, {
      ...rest,
      headers,
    })
  } catch {
    throw new Error('Network error. Please try again.')
  }

  let data = null
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { detail: text }
    }
  }

  if (!response.ok) {
    const message = getErrorMessage(data, response.status, cleanPath)
    if (
      shouldForceLogout({
        path: cleanPath,
        status: response.status,
        message: pickRawMessage(data) || message,
      })
    ) {
      forceLogoutAndRedirect()
    }
    throw new Error(message)
  }

  return data
}
