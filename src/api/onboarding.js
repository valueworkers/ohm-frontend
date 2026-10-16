import { apiRequest } from './client'
import { compressImage } from '../utils/compressImage'

function buildFullAddress(form) {
  return [
    form.addressLine1,
    form.addressLine2,
    form.locality,
    form.city,
    form.pincode,
  ]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(', ')
}

export function buildOnboardingPayload(form) {
  const organizationName = form.tenantName.trim()
  const addressLine1 = form.addressLine1.trim()
  const addressLine2 = form.addressLine2.trim()
  const locality = form.locality.trim()
  const city = form.city.trim()
  const pincode = form.pincode.trim()
  const address = buildFullAddress(form)

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

  return {
    organization_name: organizationName,
    email: form.email.trim(),
    contact_phone: form.phone.trim(),
    gst_number: String(form.gst || '')
      .trim()
      .toUpperCase(),
    address_line_1: addressLine1,
    address_line_2: addressLine2,
    locality,
    city,
    pincode,
    address,
    branches,
    co_owner_emails:
      form.wantsCoOwners === 'yes'
        ? form.coOwnerEmails
            .map((email) => email.trim())
            .filter(Boolean)
            .slice(0, 3)
        : [],
    slug,
    custom_domain:
      form.hasDomain === 'yes' ? form.customDomain.trim() : '',
    wants_custom_website: form.customizeWebsite === 'yes',
  }
}

export async function buildOnboardingFormData(form) {
  const payload = buildOnboardingPayload(form)
  const body = new FormData()

  body.append('organization_name', payload.organization_name)
  body.append('email', payload.email)
  body.append('contact_phone', payload.contact_phone)
  if (payload.gst_number) {
    body.append('gst_number', payload.gst_number)
  }
  body.append('address_line_1', payload.address_line_1)
  body.append('address_line_2', payload.address_line_2)
  body.append('locality', payload.locality)
  body.append('city', payload.city)
  body.append('pincode', payload.pincode)
  body.append('address', payload.address)
  body.append('branches', JSON.stringify(payload.branches))
  body.append('co_owner_emails', JSON.stringify(payload.co_owner_emails))
  body.append('slug', payload.slug)
  body.append('custom_domain', payload.custom_domain)
  body.append('wants_custom_website', String(payload.wants_custom_website))

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

  if (cleanSlug.length < 3) {
    return {
      available: false,
      slug: cleanSlug,
      message: 'Subdomain must be at least 3 characters.',
    }
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
