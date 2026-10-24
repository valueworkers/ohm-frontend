import { parseTenantBaseFromPath } from '../template/tenantContext'
import { resolveTenantSlugFromHost } from './tenantSite'

/**
 * Only resolve a tenant slug when we are actually on a tenant site:
 * - subdomain: care.o-hm.com
 * - path mode (local): /t/{slug}/{id}/...
 * Never use stored profile on o-hm.com / platform hosts.
 */
export function resolveCurrentTenantSlug() {
  if (typeof window === 'undefined') return null

  const fromHost = resolveTenantSlugFromHost(window.location.hostname)
  if (fromHost) return fromHost

  const fromPath = parseTenantBaseFromPath(window.location.pathname)
  if (fromPath?.slug) return fromPath.slug

  return null
}

export function shouldSendTenantHeader() {
  return Boolean(resolveCurrentTenantSlug())
}

export function getTenantHeaders(slug = resolveCurrentTenantSlug()) {
  if (!slug) return {}
  return { 'X-Tenant': String(slug) }
}
