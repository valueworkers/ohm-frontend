import { apiRequest } from './client'
import { compressImage } from '../utils/compressImage'

function mapBranch(branch) {
  return {
    name: String(branch.name || '').trim(),
    line1: String(branch.addressLine1 || '').trim(),
    line2: String(branch.addressLine2 || '').trim(),
    locality: String(branch.locality || '').trim(),
    city: String(branch.city || '').trim(),
    pincode: String(branch.pincode || '').trim(),
  }
}

function buildCoOwnerEmails(form) {
  if (form.wantsCoOwners !== 'yes') return null

  const emails = (form.coOwnerEmails || [])
    .map((email) => String(email || '').trim())
    .slice(0, 3)

  // Keep empty slots as " " so the API receives e.g. ["test@test.com", " "]
  const normalized = emails.map((email) => (email ? email : ' '))
  const hasAny = normalized.some((email) => email.trim())
  return hasAny ? normalized : null
}

export function buildOnboardingPayload(form) {
  const organizationName = form.tenantName.trim()

  const branches = form.branches
    .filter(
      (branch) =>
        branch.name.trim() ||
        branch.addressLine1.trim() ||
        branch.addressLine2.trim() ||
        branch.locality.trim() ||
        branch.city.trim() ||
        branch.pincode.trim()
    )
    .map(mapBranch)

  let slug = form.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')

  // Custom-domain tenants skip free subdomain UI; derive a slug for the API
  if (!slug && form.hasDomain === 'yes') {
    slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48)
  }

  const coOwnerEmails = buildCoOwnerEmails(form)

  return {
    organization_name: organizationName,
    logo: form.tenantLogo instanceof File ? form.tenantLogo : null,
    email: form.email.trim(),
    contact_phone: form.phone.trim(),
    gst_number: String(form.gst || '')
      .trim()
      .toUpperCase(),
    branches,
    ops_admin_email: String(form.opsAdminEmail || '').trim(),
    co_owner_emails: coOwnerEmails,
    slug,
    custom_domain: form.hasDomain === 'yes' ? form.customDomain.trim() : '',
    wants_custom_website: form.customizeWebsite === 'yes',
    requested_plan: form.requestedPlan ?? null,
  }
}

export async function buildOnboardingFormData(form) {
  const payload = buildOnboardingPayload(form)
  const body = new FormData()

  body.append('organization_name', payload.organization_name)
  body.append('email', payload.email)
  body.append('contact_phone', payload.contact_phone)
  body.append('gst_number', payload.gst_number || '')
  body.append('branches', JSON.stringify(payload.branches))
  body.append('ops_admin_email', payload.ops_admin_email || '')
  body.append(
    'co_owner_emails',
    payload.co_owner_emails ? JSON.stringify(payload.co_owner_emails) : ''
  )
  body.append('slug', payload.slug)
  body.append('custom_domain', payload.custom_domain || '')
  body.append('wants_custom_website', String(Boolean(payload.wants_custom_website)))
  body.append(
    'requested_plan',
    payload.requested_plan == null ? '' : String(payload.requested_plan)
  )

  if (form.tenantLogo instanceof File) {
    const logo = await compressImage(form.tenantLogo, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      maxBytes: 200 * 1024,
    })
    body.append('logo', logo)
  }

  return body
}

export async function submitOnboardingRequest(form) {
  return apiRequest('api/platform/onboarding/requests/', {
    method: 'POST',
    body: await buildOnboardingFormData(form),
  })
}

export async function checkSlugAvailability(slug) {
  const cleanSlug = String(slug || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')

  if (!cleanSlug) {
    return { available: false, slug: cleanSlug, message: 'Enter a subdomain.' }
  }

  if (cleanSlug.length < 3) {
    return {
      available: false,
      slug: cleanSlug,
      message: 'Subdomain must be at least 3 characters.',
    }
  }

  const data = await apiRequest(
    `api/platform/onboarding/check-slug/?slug=${encodeURIComponent(cleanSlug)}`
  )

  const available =
    data?.available ??
    data?.is_available ??
    data?.isAvailable ??
    (typeof data?.exists === 'boolean' ? !data.exists : undefined) ??
    (typeof data?.taken === 'boolean' ? !data.taken : undefined)

  return {
    available: Boolean(available),
    slug: cleanSlug,
    message:
      data?.message ||
      data?.detail ||
      (available
        ? `${cleanSlug}.o-hm.com is available`
        : `${cleanSlug}.o-hm.com is already taken`),
    raw: data,
  }
}
