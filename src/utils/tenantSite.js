import {
  normalizeTenantProfile,
  writeTenantProfile,
} from '../template/tenantContext'

const PLATFORM_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  'o-hm.com',
  'www.o-hm.com',
  'api.o-hm.com',
])

export function getTenantSlug(tenant) {
  if (!tenant) return null
  return (
    tenant.slug ||
    tenant.schema_name ||
    tenant.domains?.find((d) => d.is_primary)?.domain?.split('.')?.[0] ||
    tenant.domains?.[0]?.domain?.split('.')?.[0] ||
    null
  )
}

export function getTenantPrimaryDomain(tenant) {
  if (!tenant) return null
  const primary =
    tenant.domains?.find((domain) => domain.is_primary) ||
    tenant.domains?.[0] ||
    null
  if (primary?.domain) return String(primary.domain).replace(/^https?:\/\//, '')

  const slug = getTenantSlug(tenant)
  return slug ? `${slug}.o-hm.com` : null
}

/** Public site URL for a tenant, e.g. https://care.o-hm.com/ */
export function getTenantPublicUrl(tenant) {
  const domain = getTenantPrimaryDomain(tenant)
  if (!domain) return null
  const protocol = window.location.protocol === 'http:' ? 'http:' : 'https:'
  return `${protocol}//${domain}/`
}

export function isLocalDevHost(hostname = window.location.hostname) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost')
  )
}

/**
 * If app is opened on a tenant subdomain (care.o-hm.com), return slug.
 * Platform hosts return null.
 */
export function resolveTenantSlugFromHost(hostname = window.location.hostname) {
  const host = String(hostname || '')
    .toLowerCase()
    .split(':')[0]

  if (!host || PLATFORM_HOSTS.has(host) || isLocalDevHost(host)) return null
  if (host.endsWith('.o-hm.com')) {
    const slug = host.replace(/\.o-hm\.com$/, '')
    if (!slug || slug.includes('.')) return null
    return slug
  }
  // Custom domain tenants: treat full host as custom; slug unknown here
  return null
}

export function rememberTenantForSite(tenant) {
  const slug = getTenantSlug(tenant)
  const profile = normalizeTenantProfile(tenant, {
    slug,
    tenantId: tenant?.id,
  })
  if (profile) writeTenantProfile(profile)
  return profile
}

export function isTenantActive(tenant) {
  return String(tenant?.status || '').toLowerCase() === 'active'
}

/** Prefer a single active tenant with a domain/schema from my/tenants. */
export function pickActiveTenant(tenants) {
  const list = Array.isArray(tenants) ? tenants : []
  const active = list.filter(
    (tenant) => isTenantActive(tenant) && getTenantSlug(tenant)
  )
  if (active.length === 1) return active[0]
  if (active.length > 1) {
    return (
      active.find((tenant) =>
        tenant.domains?.some((domain) => domain.is_primary && domain.verified)
      ) ||
      active.find((tenant) => tenant.domains?.some((domain) => domain.is_primary)) ||
      active[0]
    )
  }
  return null
}

/**
 * Navigate to the tenant public site.
 * Localhost falls back to /t/{slug}/{id}/ so template still works in dev.
 */
export function navigateToTenantSite(tenant, { confirm = true } = {}) {
  const domain = getTenantPrimaryDomain(tenant)
  const profile = rememberTenantForSite(tenant)
  if (!profile?.slug || profile.tenantId == null) return false

  const loginPath = isLocalDevHost()
    ? `/t/${encodeURIComponent(profile.slug)}/${encodeURIComponent(profile.tenantId)}/login`
    : `${getTenantPublicUrl(tenant)}login`

  if (!loginPath) return false

  if (confirm) {
    const label = domain || profile.slug
    const ok = window.confirm(`Open sign-in for ${label}?`)
    if (!ok) return false
  }

  window.location.assign(loginPath)
  return true
}
