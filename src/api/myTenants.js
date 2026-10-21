import { apiRequest } from './client'
import { compressImage } from '../utils/compressImage'

function asList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.tenants)) return data.tenants
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function listMyTenants() {
  const data = await apiRequest('api/platform/my/tenants/', { auth: true })
  return asList(data)
}

export async function getMyTenant(tenantId) {
  return apiRequest(`api/platform/my/tenants/${tenantId}/`, { auth: true })
}

export async function updateMyTenant(tenantId, fields) {
  const hasLogo = fields.logo instanceof File
  const tags = Array.isArray(fields.tags)
    ? fields.tags
    : String(fields.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

  if (hasLogo) {
    const body = new FormData()
    body.append('name', String(fields.name || '').trim())
    body.append('contact_email', String(fields.contact_email || '').trim())
    body.append('contact_phone', String(fields.contact_phone || '').trim())
    body.append('timezone', String(fields.timezone || '').trim())
    body.append('default_currency', String(fields.default_currency || '').trim())
    body.append('tags', JSON.stringify(tags))

    const logo = await compressImage(fields.logo, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      maxBytes: 200 * 1024,
    })
    body.append('logo', logo)

    return apiRequest(`api/platform/my/tenants/${tenantId}/`, {
      auth: true,
      method: 'PATCH',
      body,
    })
  }

  return apiRequest(`api/platform/my/tenants/${tenantId}/`, {
    auth: true,
    method: 'PATCH',
    body: JSON.stringify({
      name: String(fields.name || '').trim(),
      contact_email: String(fields.contact_email || '').trim(),
      contact_phone: String(fields.contact_phone || '').trim(),
      timezone: String(fields.timezone || '').trim(),
      default_currency: String(fields.default_currency || '').trim(),
      tags,
    }),
  })
}

export async function activateMyTenant(tenantId) {
  return apiRequest(`api/platform/my/tenants/${tenantId}/activate/`, {
    auth: true,
    method: 'POST',
  })
}
