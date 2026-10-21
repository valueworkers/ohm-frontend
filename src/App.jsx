import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import AuthSessionListener from './components/AuthSessionListener'
import Navbar from './components/Navbar'
import SiteFooter from './components/SiteFooter'
import BookCarePage from './pages/BookCarePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MyTenantsPage from './pages/MyTenantsPage'
import OwnerProfilePage from './pages/OwnerProfilePage'
import PricingPage from './pages/PricingPage'
import TenantDetailPage from './pages/TenantDetailPage'
import TemplateRoot from './template/TemplateRoot'
import {
  buildTenantBasePath,
  parseTenantBaseFromPath,
  readTenantProfile,
} from './template/tenantContext'
import {
  getTenantSlug,
  resolveTenantSlugFromHost,
} from './utils/tenantSite'
import { listMyTenants } from './api/myTenants'
import { isAuthenticated } from './api/auth'
import './App.css'

function EnterTenantTemplate() {
  const { slug, tenantId } = useParams()

  useEffect(() => {
    const base = buildTenantBasePath(slug, tenantId)
    if (base) {
      window.location.replace(`${base}/`)
    }
  }, [slug, tenantId])

  return (
    <p style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
      Opening tenant site…
    </p>
  )
}

function PlatformApp() {
  return (
    <BrowserRouter>
      <div className="app">
        <AuthSessionListener />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book-care" element={<BookCarePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/my-tenants" element={<MyTenantsPage />} />
            <Route path="/profile" element={<OwnerProfilePage />} />
            <Route path="/tenants/:tenantId" element={<TenantDetailPage />} />
            <Route path="/t/:slug/:tenantId/*" element={<EnterTenantTemplate />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  )
}

function HostTenantApp({ slug }) {
  const stored = readTenantProfile()
  const storedMatches =
    stored && String(stored.slug) === String(slug) ? stored : null
  const [tenantId, setTenantId] = useState(storedMatches?.tenantId || null)
  const [isResolving, setIsResolving] = useState(!storedMatches?.tenantId)

  useEffect(() => {
    if (tenantId) return undefined
    if (!isAuthenticated()) {
      setIsResolving(false)
      return undefined
    }

    let cancelled = false
    listMyTenants()
      .then((tenants) => {
        if (cancelled) return
        const match = tenants.find(
          (tenant) => String(getTenantSlug(tenant)) === String(slug)
        )
        if (match?.id != null) {
          setTenantId(String(match.id))
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsResolving(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug, tenantId])

  if (isResolving) {
    return (
      <p style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
        Loading tenant site…
      </p>
    )
  }

  if (!tenantId) {
    return (
      <TemplateRoot slug={slug} tenantId={slug} basename="" />
    )
  }

  return <TemplateRoot slug={slug} tenantId={tenantId} basename="" />
}

function App() {
  const pathTenant = parseTenantBaseFromPath(window.location.pathname)
  if (pathTenant) {
    return (
      <TemplateRoot
        slug={pathTenant.slug}
        tenantId={pathTenant.tenantId}
        basename={pathTenant.basename}
      />
    )
  }

  const hostSlug = resolveTenantSlugFromHost()
  if (hostSlug) {
    return <HostTenantApp slug={hostSlug} />
  }

  return <PlatformApp />
}

export default App
