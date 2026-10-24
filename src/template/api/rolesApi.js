import { apiRequest } from '../../api/client'

function asList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.roles)) return data.roles
  if (Array.isArray(data?.permissions)) return data.permissions
  if (Array.isArray(data?.assignments)) return data.assignments
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function listRoles() {
  const data = await apiRequest('api/roles/', { auth: true })
  return asList(data)
}

export async function getRole(roleId) {
  return apiRequest(`api/roles/${roleId}/`, { auth: true })
}

export async function createRole(payload) {
  return apiRequest('api/roles/', {
    auth: true,
    method: 'POST',
    body: JSON.stringify({
      code: String(payload.code || '').trim(),
      name: String(payload.name || '').trim(),
      rank: Number(payload.rank),
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    }),
  })
}

export async function updateRole(roleId, payload) {
  return apiRequest(`api/roles/${roleId}/`, {
    auth: true,
    method: 'PATCH',
    body: JSON.stringify({
      name: String(payload.name || '').trim(),
      rank: Number(payload.rank),
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    }),
  })
}

export async function deleteRole(roleId) {
  return apiRequest(`api/roles/${roleId}/`, {
    auth: true,
    method: 'DELETE',
  })
}

export async function listPermissions() {
  const data = await apiRequest('api/roles/permissions/', { auth: true })
  return asList(data)
}

export async function listRoleAssignments(userId) {
  const data = await apiRequest(
    `api/role-assignments/?user_id=${encodeURIComponent(String(userId))}`,
    { auth: true }
  )
  return asList(data)
}

export async function createRoleAssignment(payload) {
  return apiRequest('api/role-assignments/', {
    auth: true,
    method: 'POST',
    body: JSON.stringify({
      user_id: String(payload.user_id),
      role_id: String(payload.role_id),
      object_type: String(payload.object_type || '').trim(),
      object_id: Number(payload.object_id),
    }),
  })
}

export async function deleteRoleAssignment(assignmentId) {
  return apiRequest(`api/role-assignments/${assignmentId}/`, {
    auth: true,
    method: 'DELETE',
  })
}
