import { useEffect, useId, useRef, useState } from 'react'
import { checkSlugAvailability, submitOnboardingRequest } from '../api/onboarding'
import { useReveal } from '../hooks/useReveal'
import { compressImage } from '../utils/compressImage'
import './TenantOnboardingForm.css'

const EMPTY_BRANCH = {
  name: '',
  addressLine1: '',
  addressLine2: '',
  locality: '',
  city: '',
  pincode: '',
}

function isBranchComplete(branch) {
  return (
    branch.name.trim() &&
    branch.addressLine1.trim() &&
    branch.locality.trim() &&
    branch.city.trim() &&
    /^\d{6}$/.test(branch.pincode.trim())
  )
}

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

const MAX_CO_OWNERS = 3

const INITIAL_FORM = {
  tenantName: '',
  tenantLogo: null,
  email: '',
  phone: '',
  gst: '',
  wantsCoOwners: 'no',
  coOwnerEmails: [''],
  branches: [{ ...EMPTY_BRANCH }],
  hasDomain: 'no',
  customDomain: '',
  slug: '',
  customizeWebsite: 'no',
}

function YesNo({ name, legend, value, onYes, onNo }) {
  return (
    <fieldset className="yes-no">
      <legend>{legend}</legend>
      <div className="segment" role="radiogroup" aria-label={legend}>
        <label className={`segment-option${value === 'yes' ? ' is-selected' : ''}`}>
          <input
            type="radio"
            name={name}
            value="yes"
            checked={value === 'yes'}
            onChange={onYes}
          />
          Yes
        </label>
        <label className={`segment-option${value === 'no' ? ' is-selected' : ''}`}>
          <input
            type="radio"
            name={name}
            value="no"
            checked={value === 'no'}
            onChange={onNo}
          />
          No
        </label>
      </div>
    </fieldset>
  )
}

function TenantOnboardingForm() {
  const sectionRef = useReveal()
  const successTitleId = useId()
  const closeModalRef = useRef(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [logoPreview, setLogoPreview] = useState('')
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [submittedSummary, setSubmittedSummary] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [slugStatus, setSlugStatus] = useState({
    state: 'idle',
    message: '',
  })
  const [areBranchesOpen, setAreBranchesOpen] = useState(false)

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const cleanSlug = form.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')

    if (!cleanSlug) {
      setSlugStatus({ state: 'idle', message: '' })
      return undefined
    }

    if (cleanSlug.length < 3) {
      setSlugStatus({
        state: 'error',
        message: 'Subdomain must be at least 3 characters.',
      })
      return undefined
    }

    let cancelled = false
    setSlugStatus({ state: 'checking', message: 'Checking availability…' })

    const timer = window.setTimeout(async () => {
      try {
        const result = await checkSlugAvailability(cleanSlug)
        if (cancelled) return
        setSlugStatus({
          state: result.available ? 'available' : 'taken',
          message: result.message,
        })
      } catch (error) {
        if (cancelled) return
        setSlugStatus({
          state: 'error',
          message: error.message || 'Could not check subdomain.',
        })
      }
    }, 450)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [form.slug])

  function updateBranch(index, field, value) {
    setForm((prev) => ({
      ...prev,
      branches: prev.branches.map((branch, i) =>
        i === index ? { ...branch, [field]: value } : branch
      ),
    }))
  }

  function addBranch() {
    setForm((prev) => ({
      ...prev,
      branches: [...prev.branches, { ...EMPTY_BRANCH }],
    }))
  }

  function removeBranch(index) {
    setForm((prev) => {
      if (prev.branches.length <= 1) return prev
      return {
        ...prev,
        branches: prev.branches.filter((_, i) => i !== index),
      }
    })
  }

  function updateCoOwnerEmail(index, value) {
    setForm((prev) => ({
      ...prev,
      coOwnerEmails: prev.coOwnerEmails.map((email, i) =>
        i === index ? value : email
      ),
    }))
  }

  function addCoOwnerEmail() {
    setForm((prev) => {
      if (prev.coOwnerEmails.length >= MAX_CO_OWNERS) return prev
      return {
        ...prev,
        coOwnerEmails: [...prev.coOwnerEmails, ''],
      }
    })
  }

  function removeCoOwnerEmail(index) {
    setForm((prev) => ({
      ...prev,
      coOwnerEmails:
        prev.coOwnerEmails.length <= 1
          ? ['']
          : prev.coOwnerEmails.filter((_, i) => i !== index),
    }))
  }

  async function handleLogoChange(event) {
    const input = event.target
    const file = input.files?.[0] ?? null

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
      setLogoPreview('')
    }

    if (!file) {
      updateField('tenantLogo', null)
      return
    }

    try {
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        maxBytes: 200 * 1024,
      })
      updateField('tenantLogo', compressed)
      setLogoPreview(URL.createObjectURL(compressed))
    } catch {
      updateField('tenantLogo', null)
      setLogoPreview('')
      setErrorMessage('Could not process logo. Try another image.')
      input.value = ''
    }
  }

  const sanitizedSlug = form.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')

  const ohmPreviewUrl = sanitizedSlug ? `${sanitizedSlug}.o-hm.com` : 'example.o-hm.com'

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!form.tenantName.trim()) {
      setErrorMessage('Organization name is required.')
      return
    }
    if (!form.email.trim()) {
      setErrorMessage('Email is required.')
      return
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      setErrorMessage('Enter a 10-digit phone number.')
      return
    }

    const gst = form.gst.trim().toUpperCase()
    if (gst && !GSTIN_PATTERN.test(gst)) {
      setErrorMessage('Enter a valid 15-character GSTIN.')
      return
    }

    if (!form.branches.some(isBranchComplete)) {
      setAreBranchesOpen(true)
      setErrorMessage(
        'At least one service location is required (branch name, address line 1, locality, city, and 6-digit pincode).'
      )
      return
    }
    const incompleteBranch = form.branches.find(
      (branch) =>
        (branch.name.trim() ||
          branch.addressLine1.trim() ||
          branch.addressLine2.trim() ||
          branch.locality.trim() ||
          branch.city.trim() ||
          branch.pincode.trim()) &&
        !isBranchComplete(branch)
    )
    if (incompleteBranch) {
      setAreBranchesOpen(true)
      setErrorMessage(
        'Complete each service location with branch name, address line 1, locality, city, and 6-digit pincode.'
      )
      return
    }

    if (form.wantsCoOwners === 'yes') {
      const emails = form.coOwnerEmails
        .map((email) => email.trim())
        .filter(Boolean)
      if (emails.length === 0) {
        setErrorMessage('Add at least one co-owner email.')
        return
      }
      if (emails.length > MAX_CO_OWNERS) {
        setErrorMessage(`You can add up to ${MAX_CO_OWNERS} co-owners.`)
        return
      }
      const invalidEmail = emails.find(
        (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      )
      if (invalidEmail) {
        setErrorMessage(`Enter a valid co-owner email (${invalidEmail}).`)
        return
      }
    }

    if (form.hasDomain === 'yes') {
      if (!form.customDomain.trim()) {
        setErrorMessage('Enter your domain.')
        return
      }
    } else {
      if (!sanitizedSlug) {
        setErrorMessage('Subdomain (slug) is required.')
        return
      }
      if (sanitizedSlug.length < 3) {
        setErrorMessage('Subdomain must be at least 3 characters.')
        return
      }
      if (slugStatus.state === 'checking') {
        setErrorMessage('Please wait while we check subdomain availability.')
        return
      }
      if (slugStatus.state === 'taken' || slugStatus.state === 'error') {
        setErrorMessage(
          slugStatus.message || 'Choose an available subdomain before submitting.'
        )
        return
      }
      if (slugStatus.state !== 'available') {
        setErrorMessage('Choose an available subdomain before submitting.')
        return
      }
    }

    setIsSubmitting(true)

    try {
      await submitOnboardingRequest({ ...form, gst })
      setSubmittedSummary({
        tenantName: form.tenantName.trim(),
        email: form.email.trim(),
        branchCount: form.branches.filter((branch) => branch.name.trim()).length,
      })
      setIsSuccessModalOpen(true)
    } catch (error) {
      setErrorMessage(error.message || 'Could not submit onboarding request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCloseSuccessModal() {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setForm(INITIAL_FORM)
    setLogoPreview('')
    setErrorMessage('')
    setSlugStatus({ state: 'idle', message: '' })
    setSubmittedSummary(null)
    setIsSuccessModalOpen(false)
    setAreBranchesOpen(false)
  }

  useEffect(() => {
    if (!isSuccessModalOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeModalRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        handleCloseSuccessModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSuccessModalOpen])

  return (
    <section
      id="onboarding"
      className="onboarding reveal"
      ref={sectionRef}
      aria-labelledby="onboarding-heading"
    >
      <div className="onboarding-inner">
        <header className="onboarding-header">
          <p className="onboarding-eyebrow">Get started</p>
          <h2 id="onboarding-heading">Tenant onboarding</h2>
          <p className="onboarding-lead">
            Share a few details about your care organization. We will set up your
            O-HM profile, branches, and optional website.
          </p>
        </header>

        <form className="onboarding-form" onSubmit={handleSubmit}>
            <section className="form-section" aria-labelledby="basics-heading">
              <div className="form-section-head">
                <span className="form-step" aria-hidden="true">
                  1
                </span>
                <div>
                  <h3 id="basics-heading">Organization basics</h3>
                  <p>Who you are and how we can reach you.</p>
                </div>
              </div>

              <div className="form-row form-row-3">
                <div className="form-field">
                  <label htmlFor="tenantName">Organization name</label>
                  <input
                    id="tenantName"
                    name="tenantName"
                    type="text"
                    required
                    autoComplete="organization"
                    value={form.tenantName}
                    onChange={(event) => updateField('tenantName', event.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="email">Primary Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    title="Enter a 10-digit phone number"
                    value={form.phone}
                    onChange={(event) => {
                      const digits = event.target.value.replace(/\D/g, '').slice(0, 10)
                      updateField('phone', digits)
                    }}
                  />
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-field">
                  <label htmlFor="gst">GST number</label>
                  <input
                    id="gst"
                    name="gst"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    maxLength={15}
                    placeholder="22AAAAA0000A1Z5"
                    spellCheck={false}
                    value={form.gst}
                    onChange={(event) => {
                      const next = event.target.value
                        .toUpperCase()
                        .replace(/[^0-9A-Z]/g, '')
                        .slice(0, 15)
                      updateField('gst', next)
                    }}
                  />
                </div>

                <div className="form-field">
                  <span className="field-label" id="logo-label">
                    Organization logo
                  </span>
                  <label htmlFor="tenantLogo" className="logo-upload">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt={`Preview of ${form.tenantName || 'organization'} logo`}
                        className="logo-preview"
                      />
                    ) : (
                      <span className="logo-upload-copy">
                        <strong>Choose an image</strong>
                        <span>PNG or JPG, square works best</span>
                      </span>
                    )}
                    <input
                      id="tenantLogo"
                      name="tenantLogo"
                      type="file"
                      accept="image/*"
                      aria-labelledby="logo-label"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="form-section" aria-labelledby="options-heading">
              <div className="form-section-head">
                <span className="form-step" aria-hidden="true">
                  2
                </span>
                <div>
                  <h3 id="options-heading">Setup options</h3>
                  <p>Tell us how this tenant should be configured.</p>
                </div>
              </div>

              <div className="form-row form-row-2 setup-options-row">
                <YesNo
                  name="wantsCoOwners"
                  legend="Do you need co-owners? (up to 3)"
                  value={form.wantsCoOwners}
                  onYes={(event) => updateField('wantsCoOwners', event.target.value)}
                  onNo={() => {
                    setForm((prev) => ({
                      ...prev,
                      wantsCoOwners: 'no',
                      coOwnerEmails: [''],
                    }))
                  }}
                />

                <YesNo
                  name="customizeWebsite"
                  legend="Do you need a customised website to be developed?"
                  value={form.customizeWebsite}
                  onYes={(event) => updateField('customizeWebsite', event.target.value)}
                  onNo={(event) => updateField('customizeWebsite', event.target.value)}
                />
              </div>

              {form.wantsCoOwners === 'yes' ? (
                <div className="co-owners-fields conditional-panel">
                  <p className="branches-hint">
                    Add up to {MAX_CO_OWNERS} co-owner emails for this organization.
                  </p>
                  <div className="co-owners-grid">
                    {form.coOwnerEmails.map((email, index) => (
                      <div key={index} className="co-owner-row">
                        <div className="form-field">
                          <label htmlFor={`co-owner-email-${index}`}>
                            Co-owner email {index + 1}
                          </label>
                          <input
                            id={`co-owner-email-${index}`}
                            name={`coOwnerEmail-${index}`}
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(event) =>
                              updateCoOwnerEmail(index, event.target.value)
                            }
                          />
                        </div>
                        {form.coOwnerEmails.length > 1 ? (
                          <button
                            type="button"
                            className="branch-remove"
                            onClick={() => removeCoOwnerEmail(index)}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {form.coOwnerEmails.length < MAX_CO_OWNERS ? (
                    <button
                      type="button"
                      className="branch-add"
                      onClick={addCoOwnerEmail}
                    >
                      Add another co-owner
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className={`branches-accordion${areBranchesOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="branches-accordion-trigger"
                  aria-expanded={areBranchesOpen}
                  onClick={() => setAreBranchesOpen((open) => !open)}
                >
                  <span className="branches-accordion-title">
                    Service locations
                    <span className="required-star" aria-hidden="true">
                      *
                    </span>
                  </span>
                  <span className="branches-accordion-meta">
                    {form.branches.filter(isBranchComplete).length > 0
                      ? `${form.branches.filter(isBranchComplete).length} added`
                      : 'Required · click to add'}
                  </span>
                  <span className="branches-accordion-chevron" aria-hidden="true" />
                </button>

                {areBranchesOpen ? (
                  <div className="branches-fields">
                    <p className="branches-hint">
                      At least one service location is required. Add more if needed.
                    </p>
                    {form.branches.map((branch, index) => (
                      <div key={index} className="branch-block">
                        <div className="branch-block-header">
                          <span>
                            Location {index + 1}
                            {index === 0 ? (
                              <span className="required-star" aria-hidden="true">
                                *
                              </span>
                            ) : null}
                          </span>
                          {form.branches.length > 1 ? (
                            <button
                              type="button"
                              className="branch-remove"
                              onClick={() => removeBranch(index)}
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                        <div className="form-row">
                          <div className="form-field">
                            <label htmlFor={`branch-name-${index}`}>
                              Branch name
                              <span className="required-star" aria-hidden="true">
                                *
                              </span>
                            </label>
                            <input
                              id={`branch-name-${index}`}
                              name={`branchName-${index}`}
                              type="text"
                              required={areBranchesOpen}
                              value={branch.name}
                              onChange={(event) =>
                                updateBranch(index, 'name', event.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="form-row form-row-2">
                          <div className="form-field">
                            <label htmlFor={`branch-address-line1-${index}`}>
                              Address line 1
                              <span className="required-star" aria-hidden="true">
                                *
                              </span>
                            </label>
                            <input
                              id={`branch-address-line1-${index}`}
                              name={`branchAddressLine1-${index}`}
                              type="text"
                              required={areBranchesOpen}
                              autoComplete="address-line1"
                              value={branch.addressLine1}
                              onChange={(event) =>
                                updateBranch(
                                  index,
                                  'addressLine1',
                                  event.target.value
                                )
                              }
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor={`branch-address-line2-${index}`}>
                              Address line 2
                            </label>
                            <input
                              id={`branch-address-line2-${index}`}
                              name={`branchAddressLine2-${index}`}
                              type="text"
                              autoComplete="address-line2"
                              value={branch.addressLine2}
                              onChange={(event) =>
                                updateBranch(
                                  index,
                                  'addressLine2',
                                  event.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="form-row form-row-3">
                          <div className="form-field">
                            <label htmlFor={`branch-locality-${index}`}>
                              Locality
                              <span className="required-star" aria-hidden="true">
                                *
                              </span>
                            </label>
                            <input
                              id={`branch-locality-${index}`}
                              name={`branchLocality-${index}`}
                              type="text"
                              required={areBranchesOpen}
                              value={branch.locality}
                              onChange={(event) =>
                                updateBranch(index, 'locality', event.target.value)
                              }
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor={`branch-city-${index}`}>
                              City
                              <span className="required-star" aria-hidden="true">
                                *
                              </span>
                            </label>
                            <input
                              id={`branch-city-${index}`}
                              name={`branchCity-${index}`}
                              type="text"
                              required={areBranchesOpen}
                              value={branch.city}
                              onChange={(event) =>
                                updateBranch(index, 'city', event.target.value)
                              }
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor={`branch-pincode-${index}`}>
                              Pincode
                              <span className="required-star" aria-hidden="true">
                                *
                              </span>
                            </label>
                            <input
                              id={`branch-pincode-${index}`}
                              name={`branchPincode-${index}`}
                              type="text"
                              required={areBranchesOpen}
                              inputMode="numeric"
                              maxLength={6}
                              pattern="[0-9]{6}"
                              title="Enter a 6-digit pincode"
                              value={branch.pincode}
                              onChange={(event) => {
                                const digits = event.target.value
                                  .replace(/\D/g, '')
                                  .slice(0, 6)
                                updateBranch(index, 'pincode', digits)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="branch-add" onClick={addBranch}>
                      Add another location
                    </button>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="form-section" aria-labelledby="website-heading">
              <div className="form-section-head">
                <span className="form-step" aria-hidden="true">
                  3
                </span>
                <div>
                  <h3 id="website-heading">Website & domain</h3>
                  <p>Use your own domain or an O-HM subdomain.</p>
                </div>
              </div>

              <div className="domain-choice-row">
                <YesNo
                  name="hasDomain"
                  legend="Do you already have a domain?"
                  value={form.hasDomain}
                  onYes={() => {
                    setForm((prev) => ({
                      ...prev,
                      hasDomain: 'yes',
                      slug: '',
                    }))
                    setSlugStatus({ state: 'idle', message: '' })
                  }}
                  onNo={() => {
                    setForm((prev) => ({
                      ...prev,
                      hasDomain: 'no',
                      customDomain: '',
                    }))
                  }}
                />

                {form.hasDomain === 'yes' ? (
                  <div className="form-field domain-choice-field">
                    <label htmlFor="customDomain">Your domain</label>
                    <input
                      id="customDomain"
                      name="customDomain"
                      type="text"
                      required
                      placeholder="yourdomain.com"
                      value={form.customDomain}
                      onChange={(event) => updateField('customDomain', event.target.value)}
                    />
                  </div>
                ) : null}
              </div>

              {form.hasDomain === 'no' ? (
                <div className="form-field">
                  <label htmlFor="slug">You can choose a free subdomain</label>
                  <div className="domain-input-wrap">
                    <input
                      id="slug"
                      name="slug"
                      type="text"
                      required
                      minLength={3}
                      placeholder="example"
                      value={form.slug}
                      onChange={(event) => updateField('slug', event.target.value)}
                      aria-describedby="slug-hint domain-preview slug-availability"
                      aria-invalid={slugStatus.state === 'taken' || slugStatus.state === 'error'}
                    />
                    <span className="domain-suffix" aria-hidden="true">
                      .o-hm.com
                    </span>
                  </div>
                  <p id="slug-hint" className="domain-preview">
                    Minimum 3 characters
                  </p>
                  <p id="domain-preview" className="domain-preview">
                    {ohmPreviewUrl} will be their website
                  </p>
                  {slugStatus.message ? (
                    <p
                      id="slug-availability"
                      className={`slug-availability is-${slugStatus.state}`}
                      role="status"
                    >
                      {slugStatus.message}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>

            <div className="form-actions">
              <div className="form-actions-copy">
                <p className="form-actions-note">
                  No payment needed now — we will review and follow up by email.
                </p>
                {errorMessage ? (
                  <p className="form-error" role="alert">
                    {errorMessage}
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                className="onboarding-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting…' : 'Submit onboarding request'}
              </button>
            </div>
          </form>

        {isSuccessModalOpen && submittedSummary ? (
          <div
            className="onboarding-modal-backdrop"
            role="presentation"
            onClick={handleCloseSuccessModal}
          >
            <div
              className="onboarding-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby={successTitleId}
              onClick={(event) => event.stopPropagation()}
            >
              <p id={successTitleId} className="onboarding-success-title">
                Request received
              </p>
              <p>
                Thanks — we recorded <strong>{submittedSummary.tenantName}</strong>
                {submittedSummary.branchCount > 0
                  ? ` with ${submittedSummary.branchCount} branch${
                      submittedSummary.branchCount === 1 ? '' : 'es'
                    }`
                  : ''}
                . Our team will follow up at {submittedSummary.email}.
              </p>
              <button
                type="button"
                className="onboarding-submit"
                ref={closeModalRef}
                onClick={handleCloseSuccessModal}
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default TenantOnboardingForm
