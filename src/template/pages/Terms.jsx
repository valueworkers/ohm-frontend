import { Link } from 'react-router-dom'
import { useTenant } from '../tenantContext'

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-xl font-bold text-slate-900 mt-10 first:mt-0">{title}</h2>
    <div className="mt-3 text-slate-600 text-[15px] leading-relaxed space-y-3">{children}</div>
  </section>
)

const Terms = () => {
  const { name, email, phone, website } = useTenant()
  const brandName = name || 'Care provider'

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-teal-600 font-semibold uppercase tracking-[0.2em] text-xs">
          {brandName}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">Terms &amp; conditions</h1>
        <p className="mt-3 text-sm text-slate-500">Template terms — replace with tenant-specific legal copy when available.</p>
        <p className="mt-2 text-slate-600 text-[15px] leading-relaxed">
          By using {brandName} websites, apps, or care services, you agree to these terms. If you do not agree, please
          do not use the services.
        </p>

        <div className="mt-8">
          <Section title="1. Use of the platform">
            <p>
              You agree to use {brandName} services only for lawful purposes and in a way that does not infringe the
              rights of others or disrupt the platform.
            </p>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the platform for unlawful or fraudulent purposes</li>
              <li>Attempt unauthorized access to systems or data</li>
              <li>Post harmful, offensive, or defamatory material</li>
            </ul>
          </Section>

          <Section title="2. Bookings &amp; care services">
            <p>
              Availability, pricing, and timelines may vary by location and care needs. Confirmed bookings may require
              caregiver assignment, medical clearance, and a written service agreement before care starts.
            </p>
          </Section>

          <Section id="cancellation" title="3. Cancellations &amp; refunds">
            <p>
              Cancellation and refund rules depend on the package selected and the notice given. Requests should be
              submitted in writing. Where a refund applies, processing times follow the original payment method.
            </p>
          </Section>

          <Section title="4. Client obligations">
            <p>To support safe care delivery, you agree to provide accurate medical and contact information, keep the
              care environment reasonably safe and accessible, and treat caregivers with respect.</p>
          </Section>

          <Section title="5. Limitation of liability">
            <p>
              Care is provided according to the agreed service scope. To the extent permitted by law, {brandName} is
              not liable for indirect or consequential losses, or outcomes arising from underlying medical conditions
              or factors outside reasonable control. Statutory rights under applicable law remain unaffected.
            </p>
          </Section>

          <Section title="6. Privacy">
            <p>
              Personal and health data is handled as described in our{' '}
              <Link to="/privacy" className="text-teal-700 font-medium hover:underline">
                Privacy policy
              </Link>
              .
            </p>
          </Section>

          <Section title="7. Contact">
            <p className="font-medium text-slate-800">{brandName}</p>
            {phone ? <p>Phone: {phone}</p> : null}
            {email ? <p>Email: {email}</p> : null}
            {website ? <p>Website: {website}</p> : null}
          </Section>
        </div>

        <p className="mt-12 text-sm text-slate-500">
          Related:{' '}
          <Link to="/privacy" className="text-teal-700 font-medium hover:underline">
            Privacy policy
          </Link>
          {' · '}
          <Link to="/about" className="text-teal-700 font-medium hover:underline">
            About us
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Terms
