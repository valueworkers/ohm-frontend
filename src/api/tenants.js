import { apiRequest } from './client'

export async function listTenants() {
  const data = await apiRequest('tenants/', { auth: true })
  return Array.isArray(data) ? data : data?.results || []
}

export async function getTenant(tenantId) {
  return apiRequest(`tenants/${tenantId}/`, { auth: true })
}
