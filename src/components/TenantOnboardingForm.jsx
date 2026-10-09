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
        <header className="onboarding-header">
          <p className="onboarding-eyebrow">Get started</p>
          <h2 id="onboarding-heading">Tenant onboarding</h2>
          <p className="onboarding-lead">
            Share a few details about your care organization. We will set up your
            O-HM profile, branches, and optional website.
          </p>
        </header>

        {status === 'submitted' ? (
          <div className="onboarding-success" role="status">
            <p className="onboarding-success-title">Request received</p>
            <p>
              Thanks — we recorded <strong>{form.tenantName}</strong>
              {branchCount > 0
                ? ` with ${branchCount} branch${branchCount === 1 ? '' : 'es'}`
                : ''}
              . Our team will follow up at {form.email}.
            </p>
            <button type="button" className="onboarding-secondary-btn" onClick={handleReset}>
              Submit another tenant
            </button>
          </div>
        ) : (
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

                <div className="form-field">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    required
                    rows={3}
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(event) => updateField('address', event.target.value)}
                  />
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

              <div className="form-row form-row-3">
                <YesNo
                  name="hasBranches"
                  legend="Do you have branches?"
                  value={form.hasBranches}
                  onYes={(event) => updateField('hasBranches', event.target.value)}
                  onNo={() => {
                    setForm((prev) => ({
                      ...prev,
                      hasBranches: 'no',
                      branches: [{ ...EMPTY_BRANCH }],
                    }))
                  }}
                />

                <YesNo
                  name="wantsOpsAdmin"
                  legend="Need an ops admin?"
                  value={form.wantsOpsAdmin}
                  onYes={(event) => updateField('wantsOpsAdmin', event.target.value)}
                  onNo={(event) => updateField('wantsOpsAdmin', event.target.value)}
                />

                <YesNo
                  name="customizeWebsite"
                  legend="Customized website?"
                  value={form.customizeWebsite}
                  onYes={(event) => updateField('customizeWebsite', event.target.value)}
                  onNo={(event) => updateField('customizeWebsite', event.target.value)}
                />
              </div>

              {form.hasBranches === 'yes' ? (
                <div className="branches-fields">
                  <p className="branches-hint">Add each branch under this organization.</p>
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
                <div className="form-row form-row-2 conditional-panel">
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

              <div className="form-row form-row-2">
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
            </section>

            <div className="form-actions">
              <p className="form-actions-note">
                No payment needed now — we will review and follow up by email.
              </p>
              <button type="submit" className="onboarding-submit">
                Submit onboarding request
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export default TenantOnboardingForm
