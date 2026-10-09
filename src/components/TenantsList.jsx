import { useReveal } from '../hooks/useReveal'
import './TenantsList.css'

const TENANTS = [
  {
    id: 't1',
    name: 'Harborview Care Group',
    type: 'Assisted living network',
    city: 'Seattle, WA',
    summary: 'Multi-location communities focused on assisted and memory care.',
    branches: [
      {
        id: 'b1',
        name: 'Harborview Waterfront',
        city: 'Seattle, WA',
        type: 'Assisted living',
        summary: 'Waterfront community with memory care and respite stays.',
      },
      {
        id: 'b2',
        name: 'Harborview Bellevue',
        city: 'Bellevue, WA',
        type: 'Memory care',
        summary: 'Secure programs for residents living with dementia.',
      },
      {
        id: 'b3',
        name: 'Harborview Tacoma',
        city: 'Tacoma, WA',
        type: 'Assisted living',
        summary: 'Family-friendly campus with rehab and respite support.',
      },
      {
        id: 'b4',
        name: 'Harborview Everett',
        city: 'Everett, WA',
        type: 'Independent living',
        summary: 'Apartment-style living with dining and wellness programs.',
      },
    ],
  },
  {
    id: 't2',
    name: 'Lotus Elder Care',
    type: 'Home care network',
    city: 'Bengaluru, KA',
    summary: 'Home care and day programs across South India.',
    branches: [
      {
        id: 'b5',
        name: 'Lotus Indiranagar',
        city: 'Bengaluru, KA',
        type: 'Home care',
        summary: 'Personal care, mobility support, and companionship.',
      },
      {
        id: 'b6',
        name: 'Lotus Whitefield',
        city: 'Bengaluru, KA',
        type: 'Day care',
        summary: 'Day programs for therapy, meals, and activities.',
      },
      {
        id: 'b7',
        name: 'Green Valley Living',
        city: 'Pune, MH',
        type: 'Assisted living',
        summary: 'Garden campus with nursing and visiting suites.',
      },
      {
        id: 'b8',
        name: 'Coastal Comfort Care',
        city: 'Kochi, KL',
        type: 'Home care',
        summary: 'Post-hospital recovery and chronic care at home.',
      },
    ],
  },
]

function TenantsList() {
  const sectionRef = useReveal()

  return (
    <section
      id="tenants"
      className="tenants reveal"
      ref={sectionRef}
      aria-labelledby="tenants-heading"
    >
      <div className="tenants-inner">
        <h2 id="tenants-heading">Care providers on O-HM</h2>
        <p className="tenants-lead">
          Each tenant can operate multiple branches. Browse sample networks and their
          locations below.
        </p>

        <div className="tenants-groups">
          {TENANTS.map((tenant, tenantIndex) => (
            <article
              key={tenant.id}
              className="tenant-group"
              style={{ '--group-index': tenantIndex }}
              aria-labelledby={`tenant-${tenant.id}`}
            >
              <header className="tenant-group-header">
                <div>
                  <p className="tenant-label">Tenant</p>
                  <h3 id={`tenant-${tenant.id}`}>{tenant.name}</h3>
                  <p className="tenant-summary">{tenant.summary}</p>
                </div>
                <div className="tenant-group-meta">
                  <span className="tenant-type">{tenant.type}</span>
                  <span className="tenant-city">{tenant.city}</span>
                </div>
              </header>

              <div className="tenant-separator" role="presentation">
                <span className="tenant-separator-line" />
                <span className="tenant-separator-label">
                  Branches for this tenant
                </span>
                <span className="tenant-separator-line" />
              </div>

              <ul className="branches-grid">
                {tenant.branches.map((branch, branchIndex) => (
                  <li
                    key={branch.id}
                    className="branch-card"
                    style={{ '--card-index': tenantIndex * 4 + branchIndex }}
                  >
                    <span className="branch-badge">Branch</span>
                    <span className="tenant-type">{branch.type}</span>
                    <h4>{branch.name}</h4>
                    <p className="tenant-summary">{branch.summary}</p>
                    <p className="tenant-city">{branch.city}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TenantsList
