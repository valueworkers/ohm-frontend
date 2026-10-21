import { useEffect, useMemo, useState } from 'react'
import { emptyFaqContactsView, fetchFaqContacts } from '../api/faqContactsApi'
import {
  formatSitePhoneDisplay,
  SITE_EMAIL,
  SITE_FACEBOOK_URL,
  SITE_INSTAGRAM_URL,
  SITE_PHONE,
  SITE_PHONE_TEL,
  SITE_WHATSAPP_URL,
} from '../constants/siteContact'
import { useTenant } from '../tenantContext'

function telHrefFromPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  return `tel:+${digits.startsWith('91') ? digits : `91${digits}`}`
}

function whatsappFromPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  const withCountry = digits.startsWith('91') ? digits : `91${digits}`
  return `https://wa.me/${withCountry}`
}

/** Loads GET /faq/contacts/; falls back to tenant profile / env. */
export const useFaqContacts = () => {
  const { email: tenantEmail, phone: tenantPhone } = useTenant()
  const [apiContacts, setApiContacts] = useState(() => emptyFaqContactsView())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = ({ force = false } = {}) => {
      setIsLoading(true)
      fetchFaqContacts({ force })
        .then((data) => {
          if (!cancelled) setApiContacts(data)
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }

    load()

    const onUpdated = () => load({ force: true })
    window.addEventListener('faq-contacts-updated', onUpdated)
    return () => {
      cancelled = true
      window.removeEventListener('faq-contacts-updated', onUpdated)
    }
  }, [])

  const contacts = useMemo(() => {
    const hasApiPhone = Boolean(apiContacts.phone || apiContacts.phoneDisplay)
    const phone = hasApiPhone ? '' : tenantPhone || SITE_PHONE || ''
    return {
      ...emptyFaqContactsView(),
      ...apiContacts,
      email: apiContacts.email || tenantEmail || SITE_EMAIL || '',
      phone: apiContacts.phone || phone,
      phoneDisplay:
        apiContacts.phoneDisplay ||
        (phone ? formatSitePhoneDisplay(phone) : ''),
      phoneTel:
        apiContacts.phoneTel ||
        telHrefFromPhone(phone) ||
        SITE_PHONE_TEL ||
        '',
      whatsappUrl:
        apiContacts.whatsappUrl ||
        whatsappFromPhone(phone) ||
        SITE_WHATSAPP_URL ||
        '',
      facebookUrl: apiContacts.facebookUrl || SITE_FACEBOOK_URL || '',
      instagramUrl: apiContacts.instagramUrl || SITE_INSTAGRAM_URL || '',
    }
  }, [apiContacts, tenantEmail, tenantPhone])

  return { contacts, isLoading }
}
