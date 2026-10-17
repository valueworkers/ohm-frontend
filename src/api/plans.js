import { apiRequest } from './client'

export async function fetchPlans() {
  const data = await apiRequest('api/platform/plans/')
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.plans)) return data.plans
  return []
}
