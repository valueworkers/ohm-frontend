import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import './TenantOnboardingForm.css'

const EMPTY_BRANCH = { name: '', address: '' }

const INITIAL_FORM = {
  tenantName: '',
  tenantLogo: null,
  email: '',
  phone: '',
  address: '',
  wantsOpsAdmin: 'no',
  opsEmail: '',
  hasBranches: 'no',
  branches: [{ ...EMPTY_BRANCH }],
  hasDomain: 'no',
  customDomain: '',
  slug: '',
  customizeWebsite: 'no',
}

function TenantOnboardingForm() {
  const sectionRef = useReveal()
  const [form, setForm] = useState(INITIAL_FORM)
  const [logoPreview, setLogoPreview] = useState('')
  const [status, setStatus] = useState('idle')

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

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
    setForm((prev) => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index),
    }))
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0] ?? null
    updateField('tenantLogo', file)

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }

    if (file) {
      setLogoPreview(URL.createObjectURL(file))
    } else {
      setLogoPreview('')
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitted')
  }

  function handleReset() {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setForm(INITIAL_FORM)
    setLogoPreview('')
    setStatus('idle')
  }

  const sanitizedSlug = form.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')

  const ohmPreviewUrl = sanitizedSlug ? `${sanitizedSlug}.o-hm.com` : 'example.o-hm.com'
  const branchCount =
    form.hasBranches === 'yes'
      ? form.branches.filter((branch) => branch.name.trim()).length
      : 0

  return (
    <section
      id="onboarding"
      className="onboarding reveal"
      ref={sectionRef}
      aria-labelledby="onboarding-heading"
    >
      <div className="onboarding-inner">
        <h2 id="onboarding-heading">Tenant onboarding</h2>
        <p className="onboarding-lead">
          Tell us about your care community. We will use this to create your O-HM
          tenant profile and optional website.
        </p>

        {status === 'submitted' ? (
          <div className="onboarding-success" role="status">
            <p>
              Thanks — we recorded your request for <strong>{form.tenantName}</strong>
              {branchCount > 0 ? ` with ${branchCount} branch${branchCount === 1 ? '' : 'es'}` : ''}.
              Our team will follow up at {form.email}.
            </p>
            <button type="button" className="onboarding-secondary-btn" onClick={handleReset}>
              Submit another tenant
            </button>
          </div>
        ) : (
          <form className="onboarding-form" onSubmit={handleSubmit} noValidate={false}>
            <div className="form-row form-row-3">
              <div className="form-field">
                <label htmlFor="tenantName">Tenant name</label>
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
                <label htmlFor="email">Email</label>
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
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-field">
                <label htmlFor="tenantLogo">Tenant logo</label>
                <input
                  id="tenantLogo"
                  name="tenantLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt={`Preview of ${form.tenantName || 'tenant'} logo`}
                    className="logo-preview"
                  />
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={2}
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(event) => updateField('address', event.target.value)}
                />
              </div>
            </div>

            <div className="form-row form-row-3 choices-grid">
              <fieldset className="form-fieldset form-fieldset-inline">
                <legend>Do you have branches?</legend>
                <div className="choice-row" role="radiogroup" aria-label="Do you have branches?">
                  <label className="choice">
                    <input
                      type="radio"
                      name="hasBranches"
                      value="yes"
                      checked={form.hasBranches === 'yes'}
                      onChange={(event) => updateField('hasBranches', event.target.value)}
                    />
                    Yes
                  </label>
                  <label className="choice">
                    <input
                      type="radio"
                      name="hasBranches"
                      value="no"
                      checked={form.hasBranches === 'no'}
                      onChange={() => {
                        setForm((prev) => ({
                          ...prev,
                          hasBranches: 'no',
                          branches: [{ ...EMPTY_BRANCH }],
                        }))
                      }}
                    />
                    No
                  </label>
                </div>
              </fieldset>

              <fieldset className="form-fieldset form-fieldset-inline">
                <legend>Ops admin?</legend>
                <div className="choice-row" role="radiogroup" aria-label="Do you want an ops admin?">
                  <label className="choice">
                    <input
                      type="radio"
                      name="wantsOpsAdmin"
                      value="yes"
                      checked={form.wantsOpsAdmin === 'yes'}
                      onChange={(event) => updateField('wantsOpsAdmin', event.target.value)}
                    />
                    Yes
                  </label>
                  <label className="choice">
                    <input
                      type="radio"
                      name="wantsOpsAdmin"
                      value="no"
                      checked={form.wantsOpsAdmin === 'no'}
                      onChange={(event) => updateField('wantsOpsAdmin', event.target.value)}
                    />
                    No
                  </label>
                </div>
              </fieldset>

              <fieldset className="form-fieldset form-fieldset-inline">
                <legend>Customized website?</legend>
                <div
                  className="choice-row"
                  role="radiogroup"
                  aria-label="Do you want a customized website?"
                >
                  <label className="choice">
                    <input
                      type="radio"
                      name="customizeWebsite"
                      value="yes"
                      checked={form.customizeWebsite === 'yes'}
                      onChange={(event) => updateField('customizeWebsite', event.target.value)}
                    />
                    Yes
                  </label>
                  <label className="choice">
                    <input
                      type="radio"
                      name="customizeWebsite"
                      value="no"
                      checked={form.customizeWebsite === 'no'}
                      onChange={(event) => updateField('customizeWebsite', event.target.value)}
                    />
                    No
                  </label>
                </div>
              </fieldset>
            </div>

            {form.hasBranches === 'yes' ? (
              <div className="branches-fields">
                <p className="branches-hint">Add each branch under this tenant.</p>
                {form.branches.map((branch, index) => (
                  <div key={index} className="branch-block">
                    <div className="branch-block-header">
                      <span>Branch {index + 1}</span>
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
                    <div className="form-row form-row-2">
                      <div className="form-field">
                        <label htmlFor={`branch-name-${index}`}>Branch name</label>
                        <input
                          id={`branch-name-${index}`}
                          name={`branchName-${index}`}
                          type="text"
                          required
                          value={branch.name}
                          onChange={(event) =>
                            updateBranch(index, 'name', event.target.value)
                          }
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor={`branch-address-${index}`}>Branch address</label>
                        <input
                          id={`branch-address-${index}`}
                          name={`branchAddress-${index}`}
                          type="text"
                          required
                          value={branch.address}
                          onChange={(event) =>
                            updateBranch(index, 'address', event.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="branch-add" onClick={addBranch}>
                  Add another branch
                </button>
              </div>
            ) : null}

            {form.wantsOpsAdmin === 'yes' ? (
              <div className="form-row form-row-2">
                <div className="form-field">
                  <label htmlFor="opsEmail">Ops admin email</label>
                  <input
                    id="opsEmail"
                    name="opsEmail"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.opsEmail}
                    onChange={(event) => updateField('opsEmail', event.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div className="form-row form-row-2">
              <fieldset className="form-fieldset form-fieldset-inline">
                <legend>Do you already have a domain?</legend>
                <div className="choice-row" role="radiogroup" aria-label="Do you already have a domain?">
                  <label className="choice">
                    <input
                      type="radio"
                      name="hasDomain"
                      value="yes"
                      checked={form.hasDomain === 'yes'}
                      onChange={() => {
                        setForm((prev) => ({
                          ...prev,
                          hasDomain: 'yes',
                          slug: '',
                        }))
                      }}
                    />
                    Yes
                  </label>
                  <label className="choice">
                    <input
                      type="radio"
                      name="hasDomain"
                      value="no"
                      checked={form.hasDomain === 'no'}
                      onChange={() => {
                        setForm((prev) => ({
                          ...prev,
                          hasDomain: 'no',
                          customDomain: '',
                        }))
                      }}
                    />
                    No
                  </label>
                </div>
              </fieldset>

              {form.hasDomain === 'yes' ? (
                <div className="form-field">
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
              ) : (
                <div className="form-field">
                  <label htmlFor="slug">Choose a subdomain</label>
                  <div className="domain-input-wrap">
                    <input
                      id="slug"
                      name="slug"
                      type="text"
                      required
                      placeholder="example"
                      value={form.slug}
                      onChange={(event) => updateField('slug', event.target.value)}
                      aria-describedby="domain-preview"
                    />
                    <span className="domain-suffix" aria-hidden="true">
                      .o-hm.com
                    </span>
                  </div>
                  <p id="domain-preview" className="domain-preview">
                    {ohmPreviewUrl} will be their website
                  </p>
                </div>
              )}
            </div>

            <button type="submit" className="onboarding-submit">
              Submit onboarding request
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default TenantOnboardingForm
