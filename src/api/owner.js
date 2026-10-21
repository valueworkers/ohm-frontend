import { apiRequest } from './client'

function asList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.owners)) return data.owners
  if (Array.isArray(data?.co_owners)) return data.co_owners
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function getOwnerMe() {
  return apiRequest('api/owner/me/', { auth: true })
}

export async function updateOwnerMe(payload) {
  return apiRequest('api/owner/me/', {
    auth: true,
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listOwners() {
  const data = await apiRequest('api/owner/', { auth: true })
  return asList(data)
}

export async function createOwner(payload) {
  return apiRequest('api/owner/', {
    auth: true,
    method: 'POST',
    body: JSON.stringify({
      email: String(payload.email || '').trim(),
      full_name: String(payload.full_name || '').trim(),
      phone: String(payload.phone || '').trim(),
    }),
  })
}

export async function updateOwner(ownerId, payload) {
  return apiRequest(`api/owner/${ownerId}/`, {
    auth: true,
    method: 'PATCH',
    body: JSON.stringify({
      email: String(payload.email || '').trim(),
      full_name: String(payload.full_name || '').trim(),
      phone: String(payload.phone || '').trim(),
    }),
  })
}

export async function deleteOwner(ownerId) {
  return apiRequest(`api/owner/${ownerId}/`, {
    auth: true,
    method: 'DELETE',
  })
}
