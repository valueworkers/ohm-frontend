import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getTenant } from '../api/tenants'
import { readAuthSession, writeAuthSession } from '../api/session'

const TENANT_PROFILE_KEY = 'ohm_tenant_profile'
export const TENANT_PROFILE_EVENT = 'ohm:tenant-profile-changed'

const TenantContext = createContext({
  slug: null,
  tenantId: null,
  profile: null,
  modules: [],
  isLoading: false,
  hasModule: () => true,
  setProfile: () => {},
})

function asArray(value) {
  if (Array.isArray(value)) return value
  if (!value) return []
  return []
}

function normalizeModules(raw) {
  return asArray(raw)
    .map((item) => {
      if (typeof item === 'string') {
        return { key: item, enabled: true, label: item }
      }
      if (!item || typeof item !== 'object') return null
      const key = item.key || item.code || item.slug || item.name || item.id
      if (!key) return null
      return {
        key: String(key),
        enabled: item.enabled !== false && item.is_enabled !== false,
        label: item.label || item.name || String(key),
        ...item,
      }
    })
    .filter(Boolean)
}

export function normalizeTenantProfile(raw, fallbacks = {}) {
  if (!raw || typeof raw !== 'object') {
    const slug = fallbacks.slug || null
    const tenantId = fallbacks.tenantId ?? null
    if (!slug && tenantId == null) return null
    return {
      slug: slug ? String(slug) : null,
      tenantId: tenantId != null ? String(tenantId) : null,
      name: slug ? String(slug) : 'Care provider',
      logo: null,
      email: null,
      phone: null,
      website: null,
      description: null,
      modules: [],
      raw: null,
    }
  }

  const nested = raw.tenant && typeof raw.tenant === 'object' ? raw.tenant : null
  const source = nested || raw

  const slug =
    source.slug ||
    source.schema_name ||
    raw.slug ||
    raw.tenant_slug ||
    fallbacks.slug ||
    null

  const tenantId =
    source.id ??
    raw.tenant_id ??
    raw.tenantId ??
    fallbacks.tenantId ??
    null

  const modules = normalizeModules(
    source.modules ||
      source.enabled_modules ||
      raw.modules ||
      raw.enabled_modules ||
      []
  )

  return {
    slug: slug ? String(slug) : null,
    tenantId: tenantId != null ? String(tenantId) : null,
    name:
      source.name ||
      source.organization_name ||
      source.display_name ||
      raw.name ||
      (slug ? String(slug) : 'Care provider'),
    logo: source.logo || source.logo_url || raw.logo || null,
    email: source.contact_email || source.email || raw.contact_email || null,
    phone: source.contact_phone || source.phone || raw.contact_phone || null,
    website:
      source.website ||
      source.custom_domain ||
      source.domains?.find((domain) => domain.is_primary)?.domain ||
      source.domains?.[0]?.domain ||
      null,
    description: source.description || source.tagline || source.about || null,
    modules,
    raw: source,
  }
}

export function readTenantProfile() {
  try {
    const raw = localStorage.getItem(TENANT_PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeTenantProfile(profile) {
  if (!profile) {
    localStorage.removeItem(TENANT_PROFILE_KEY)
  } else {
    localStorage.setItem(TENANT_PROFILE_KEY, JSON.stringify(profile))
  }
  window.dispatchEvent(new Event(TENANT_PROFILE_EVENT))
}

export function extractTenantFromAuthPayload(payload) {
  const fromNested = payload?.tenant || payload?.user?.tenant || null
  const profile = normalizeTenantProfile(fromNested || payload, {
    slug:
      payload?.slug ||
      payload?.tenant_slug ||
      payload?.user?.tenant_slug ||
      payload?.user?.slug ||
      null,
    tenantId:
      payload?.tenant_id ??
      payload?.tenantId ??
      payload?.user?.tenant_id ??
      payload?.user?.tenantId ??
      null,
  })

  if (!profile?.slug || profile.tenantId == null || profile.tenantId === '') {
    return null
  }
  return profile
}

export function buildTenantBasePath(slug, tenantId) {
  if (!slug || tenantId == null || tenantId === '') return null
  return `/t/${encodeURIComponent(String(slug))}/${encodeURIComponent(String(tenantId))}`
}

export function parseTenantBaseFromPath(pathname) {
  const match = String(pathname || '').match(/^\/t\/([^/]+)\/([^/]+)/)
  if (!match) return null
  return {
    slug: decodeURIComponent(match[1]),
    tenantId: decodeURIComponent(match[2]),
    basename: `/t/${match[1]}/${match[2]}`,
  }
}

function seedProfile(slug, tenantId) {
  const stored = readTenantProfile()
  if (
    stored &&
    String(stored.slug) === String(slug) &&
    String(stored.tenantId) === String(tenantId)
  ) {
    return stored
  }

  const sessionTenant = readAuthSession()?.tenant
  if (
    sessionTenant &&
    String(sessionTenant.slug) === String(slug) &&
    String(sessionTenant.tenantId) === String(tenantId)
  ) {
    return normalizeTenantProfile(sessionTenant, { slug, tenantId })
  }

  return normalizeTenantProfile(null, { slug, tenantId })
}

export function TenantProvider({ slug, tenantId, children }) {
  const [profile, setProfileState] = useState(() => seedProfile(slug, tenantId))
  const [isLoading, setIsLoading] = useState(false)

  const setProfile = useCallback((next) => {
    const normalized = normalizeTenantProfile(next, {
      slug: next?.slug || slug,
      tenantId: next?.tenantId ?? next?.id ?? tenantId,
    })
    setProfileState(normalized)
    writeTenantProfile(normalized)

    const session = readAuthSession()
    if (session) {
      writeAuthSession({ ...session, tenant: normalized })
    }
  }, [slug, tenantId])

  useEffect(() => {
    setProfileState(seedProfile(slug, tenantId))
  }, [slug, tenantId])

  useEffect(() => {
    if (!tenantId) return undefined

    let cancelled = false
    setIsLoading(true)

    getTenant(tenantId)
      .then((data) => {
        if (cancelled || !data) return
        const next = normalizeTenantProfile(data, { slug, tenantId })
        setProfileState(next)
        writeTenantProfile(next)
        const session = readAuthSession()
        if (session) {
          writeAuthSession({ ...session, tenant: next })
        }
      })
      .catch(() => {
        // Keep seeded / login profile if fetch fails (e.g. unauthenticated browse).
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug, tenantId])

  const modules = profile?.modules || []

  const hasModule = useCallback(
    (key) => {
      if (!key) return true
      if (!modules.length) return true
      const needle = String(key).toLowerCase()
      return modules.some(
        (mod) =>
          mod.enabled !== false &&
          String(mod.key).toLowerCase() === needle
      )
    },
    [modules]
  )

  const value = useMemo(
    () => ({
      slug: profile?.slug || (slug ? String(slug) : null),
      tenantId:
        profile?.tenantId ||
        (tenantId != null ? String(tenantId) : null),
      profile,
      modules,
      isLoading,
      hasModule,
      setProfile,
      name: profile?.name || slug || 'Care provider',
      logo: profile?.logo || null,
      email: profile?.email || null,
      phone: profile?.phone || null,
      description: profile?.description || null,
    }),
    [profile, slug, tenantId, modules, isLoading, hasModule, setProfile]
  )

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}
