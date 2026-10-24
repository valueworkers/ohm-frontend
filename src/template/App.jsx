import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect, useMemo } from 'react'
import NavBar from './components/NavBar'
import LoginModal from './components/LoginModal'
import { useTenant } from './tenantContext'
import './App.css'

const Home = lazy(() => import('./pages/Home'))
const SeniorCare = lazy(() => import('./pages/SeniorCare'))
const InHouse = lazy(() => import('./pages/InHouse'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const MyBookings = lazy(() => import('./pages/MyBookings'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const Settings = lazy(() => import('./pages/Settings'))
const CustomizeProfile = lazy(() => import('./pages/CustomizeProfile'))
const CreatePersona = lazy(() => import('./pages/CreatePersona'))
const PersonaPermissions = lazy(() => import('./pages/PersonaPermissions'))
const Payment = lazy(() => import('./pages/Payment'))
const Login = lazy(() => import('./components/Login'))
const ResetPassowrd = lazy(() => import('./components/ResetPassowrd'))
const BookingDashboard = lazy(() => import('./components/Dashboard/BookingDashboard'))
const About = lazy(() => import('./pages/About'))
const Media = lazy(() => import('./pages/Media'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const AccountHub = lazy(() => import('./pages/AccountHub'))
const AccessHub = lazy(() => import('./pages/AccessHub'))

function buildDefaultSeo(brandName) {
  return {
    title: `${brandName} | Senior Care Services`,
    description: `${brandName} offers reliable senior care and nursing support services with compassionate caregivers.`,
    keywords: 'senior care services, caregiver services, home care',
    index: true,
  }
}

function buildSeoConfig(brandName) {
  return {
    '/': {
      title: `${brandName} | Senior Care & In-Home Nursing Services`,
      description: `Book trusted senior care, in-home nursing, and assisted living services with ${brandName}.`,
      keywords: 'senior care, in home nursing, elderly care, home health care',
      index: true,
    },
    '/senior-care': {
      title: `Book Senior Care at Home | ${brandName}`,
      description: `Schedule personalized at-home senior care with ${brandName}.`,
      keywords: 'senior care booking, at home elder care, home nurse booking',
      index: true,
    },
    '/in-house': {
      title: `In-House Senior Care Packages | ${brandName}`,
      description: `Explore in-house senior care options with ${brandName}.`,
      keywords: 'in house senior care, assisted care facility, care home services',
      index: true,
    },
    '/about': {
      title: `About Us | ${brandName}`,
      description: `Learn about ${brandName} and how we help families arrange senior care.`,
      keywords: 'about, senior care company, home care india',
      index: true,
    },
    '/media': {
      title: `Media | ${brandName}`,
      description: `Browse ${brandName} photos, blogs, videos, and community discussions.`,
      keywords: 'media, senior care blogs, home nursing videos',
      index: true,
    },
    '/terms': {
      title: `Terms & Conditions | ${brandName}`,
      description: `Terms of use, bookings, cancellations, and refunds for ${brandName} services.`,
      keywords: 'terms, cancellation, refund policy',
      index: true,
    },
    '/privacy': {
      title: `Privacy Policy | ${brandName}`,
      description: `How ${brandName} collects, uses, and protects your personal information.`,
      keywords: 'privacy policy, data protection',
      index: true,
    },
    '/dashboard': {
      title: `Dashboard | ${brandName}`,
      description: 'Manage bookings, staff, and care operations.',
      keywords: 'dashboard',
      index: false,
    },
    '/my-bookings': {
      title: `My Bookings | ${brandName}`,
      description: 'View and manage your care bookings.',
      keywords: 'bookings',
      index: false,
    },
    '/my-orders': {
      title: `My Orders | ${brandName}`,
      description: 'View your care orders and payments.',
      keywords: 'orders',
      index: false,
    },
    '/settings': {
      title: `Settings | ${brandName}`,
      description: 'Account and workspace settings.',
      keywords: 'settings',
      index: false,
    },
    '/customize-profile': {
      title: `Customize Profile | ${brandName}`,
      description: 'Customize your care provider profile.',
      keywords: 'profile',
      index: false,
    },
    '/create-persona': {
      title: `Create Persona | ${brandName}`,
      description: 'Create a persona for your workspace.',
      keywords: 'persona',
      index: false,
    },
    '/persona-permissions': {
      title: `Permissions | ${brandName}`,
      description: 'Manage persona permissions.',
      keywords: 'permissions',
      index: false,
    },
    '/create-owner': {
      title: `Create Persona | ${brandName}`,
      description: 'Create a persona for your workspace.',
      keywords: 'persona',
      index: false,
    },
    '/pay': {
      title: `Payment | ${brandName}`,
      description: 'Complete your care payment.',
      keywords: 'payment',
      index: false,
    },
    '/login': {
      title: `Login | ${brandName}`,
      description: `Sign in to ${brandName}.`,
      keywords: 'login',
      index: false,
    },
    '/reset-password': {
      title: `Reset Password | ${brandName}`,
      description: `Reset your ${brandName} account password.`,
      keywords: 'reset password',
      index: false,
    },
    '/booking': {
      title: `Booking Dashboard | ${brandName}`,
      description: 'Manage bookings and availability.',
      keywords: 'booking dashboard',
      index: false,
    },
  }
}

const upsertMeta = ({ name, property, content }) => {
  if (!content) return
  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    if (name) tag.setAttribute('name', name)
    if (property) tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

const upsertLink = ({ rel, href }) => {
  if (!href) return
  let tag = document.head.querySelector(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

function SeoManager() {
  const { pathname } = useLocation()
  const { name: brandName, logo: brandLogo } = useTenant()
  const seoConfig = useMemo(() => buildSeoConfig(brandName), [brandName])
  const defaultSeo = useMemo(() => buildDefaultSeo(brandName), [brandName])

  useEffect(() => {
    const routeSeo = seoConfig[pathname] || defaultSeo
    const origin = window.location.origin
    const canonical = `${origin}${pathname}`
    const ogImage = brandLogo || ''
    const robots = routeSeo.index ? 'index, follow' : 'noindex, nofollow'

    document.title = routeSeo.title

    upsertMeta({ name: 'description', content: routeSeo.description })
    upsertMeta({ name: 'keywords', content: routeSeo.keywords })
    upsertMeta({ name: 'robots', content: robots })
    upsertMeta({ property: 'og:title', content: routeSeo.title })
    upsertMeta({ property: 'og:description', content: routeSeo.description })
    upsertMeta({ property: 'og:type', content: 'website' })
    upsertMeta({ property: 'og:site_name', content: brandName })
    upsertMeta({ property: 'og:locale', content: 'en_IN' })
    upsertMeta({ property: 'og:url', content: canonical })
    upsertMeta({ property: 'og:image', content: ogImage })
    upsertMeta({ name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta({ name: 'twitter:title', content: routeSeo.title })
    upsertMeta({ name: 'twitter:description', content: routeSeo.description })
    upsertMeta({ name: 'twitter:image', content: ogImage })
    upsertMeta({ name: 'theme-color', content: '#0f766e' })

    upsertLink({ rel: 'canonical', href: canonical })

    const schemaId = 'tenant-organization-schema'
    let existingSchema = document.getElementById(schemaId)
    if (!existingSchema) {
      existingSchema = document.createElement('script')
      existingSchema.id = schemaId
      existingSchema.type = 'application/ld+json'
      document.head.appendChild(existingSchema)
    }
    existingSchema.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: brandName,
      url: origin,
      logo: ogImage,
      sameAs: [],
    })

    const websiteSchemaId = 'tenant-website-schema'
    let existingWebsiteSchema = document.getElementById(websiteSchemaId)
    if (!existingWebsiteSchema) {
      existingWebsiteSchema = document.createElement('script')
      existingWebsiteSchema.id = websiteSchemaId
      existingWebsiteSchema.type = 'application/ld+json'
      document.head.appendChild(existingWebsiteSchema)
    }
    existingWebsiteSchema.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: brandName,
      url: origin,
      inLanguage: 'en-IN',
    })
  }, [pathname, brandName, brandLogo, seoConfig, defaultSeo])

  return null
}

function App() {
  return (
    <>
      <SeoManager />
      <div className="min-h-screen bg-gray-50 text-gray-900 text-[15px] leading-normal">
        <NavBar />
        <LoginModal />
        <main>
          <Suspense
            fallback={
              <div className="min-h-[40vh] flex items-center justify-center text-slate-500">Loading page...</div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/media" element={<Media />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/senior-care" element={<SeniorCare />} />
              <Route path="/in-house" element={<InHouse />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/customize-profile" element={<CustomizeProfile />} />
              <Route path="/create-persona" element={<CreatePersona />} />
              <Route path="/create-owner" element={<CreatePersona />} />
              <Route path="/persona-permissions" element={<PersonaPermissions />} />
              <Route path="/pay" element={<Payment />} />
              <Route path="/login" element={<Login />} />
              <Route path="/account" element={<AccountHub />} />
              <Route path="/access" element={<AccessHub />} />
              <Route path="/profile" element={<Navigate to="/account" replace />} />
              <Route path="/my-tenants" element={<Navigate to="/account?tab=tenants" replace />} />
              <Route path="/co-owners" element={<Navigate to="/access?tab=co-owners" replace />} />
              <Route path="/roles" element={<Navigate to="/access" replace />} />
              <Route path="/role-assignments" element={<Navigate to="/access?tab=assignments" replace />} />
              <Route path="/reset-password" element={<ResetPassowrd />} />
              <Route path="/booking" element={<BookingDashboard />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </>
  )
}

export default App
