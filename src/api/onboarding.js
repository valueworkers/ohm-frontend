import { apiRequest } from './client'
import { compressImage } from '../utils/compressImage'

export function buildOnboardingPayload(form) {
  const organizationName = form.tenantName.trim()
  const address = form.address.trim()

  let branches =
    form.hasBranches === 'yes'
      ? form.branches
          .filter((branch) => branch.name.trim() || branch.address.trim())
          .map((branch) => ({
            name: branch.name.trim(),
            address: branch.address.trim(),
          }))
      : []

  // API requires branches (not null); use org as main branch when none are listed
  if (branches.length === 0) {
    branches = [
      {
        name: organizationName || 'Main',
        address,
      },
    ]
  }

  const slug = form.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')

  return {
    organization_name: organizationName,
    email: form.email.trim(),
    contact_phone: form.phone.trim(),
    address,
    branches,
    ops_admin_email:
      form.wantsOpsAdmin === 'yes' ? form.opsEmail.trim() : '',
    slug,
    custom_domain:
      form.hasDomain === 'yes' ? form.customDomain.trim() : '',
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
  body.append('address', payload.address)
  body.append('branches', JSON.stringify(payload.branches))
  body.append('ops_admin_email', payload.ops_admin_email)
  body.append('slug', payload.slug)
  body.append('custom_domain', payload.custom_domain)
  body.append('wants_custom_website', String(payload.wants_custom_website))

  if (payload.requested_plan != null) {
    body.append('requested_plan', String(payload.requested_plan))
  }

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
  return apiRequest('onboarding/requests/', {
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

  const data = await apiRequest(
    `onboarding/check-slug/?slug=${encodeURIComponent(cleanSlug)}`
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
