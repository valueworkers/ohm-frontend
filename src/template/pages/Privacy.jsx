import { Link } from 'react-router-dom'
import { useTenant } from '../tenantContext'

const Privacy = () => {
  const { name, email, phone, website, profile } = useTenant()
  const brandName = name || 'Care provider'
  const address =
    profile?.raw?.address ||
    profile?.raw?.address_line_1 ||
    [profile?.raw?.locality, profile?.raw?.city, profile?.raw?.pincode]
      .filter(Boolean)
      .join(', ') ||
    null

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-teal-600 font-semibold uppercase tracking-[0.2em] text-xs">
          {brandName}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">Privacy policy</h1>
        <p className="mt-3 text-sm text-slate-500">
          Template policy — replace with tenant-specific legal copy when available.
        </p>
        <p className="mt-2 text-slate-600 text-[15px] leading-relaxed">
          This policy explains how {brandName} collects, uses, and protects personal information when you use our
          website, app, or care services.
        </p>

        <div className="mt-8 space-y-8 text-slate-600 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900">1. Who we are</h2>
            <p className="mt-3">
              {brandName} is responsible for personal data collected in connection with care services and this
              website.
            </p>
            {address ? <p className="mt-2">{address}</p> : null}
            {website ? <p>Website: {website}</p> : null}
            {email ? <p>Email: {email}</p> : null}
            {phone ? <p>Phone: {phone}</p> : null}
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">2. What we collect</h2>
            <p className="mt-3">Depending on how you use the service, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Contact details (name, phone, email)</li>
              <li>Booking and care preference information</li>
              <li>Health-related details needed to deliver care (with consent)</li>
              <li>Basic technical data such as device or usage logs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">3. How we use data</h2>
            <p className="mt-3">We use personal data to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Provide and coordinate care services</li>
              <li>Communicate about bookings, support, and service updates</li>
              <li>Improve safety, quality, and platform reliability</li>
              <li>Meet legal and regulatory obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">4. Sharing</h2>
            <p className="mt-3">
              We do not sell personal data for marketing. Data may be shared with caregivers, clinicians, or service
              partners only as needed to deliver care, or when required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">5. Your rights</h2>
            <p className="mt-3">
              Subject to applicable law, you may request access, correction, or deletion of your personal data, or
              raise a privacy concern with {brandName}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">6. Contact</h2>
            <p className="mt-3 font-medium text-slate-800">{brandName}</p>
            {email ? <p>Email: {email}</p> : null}
            {phone ? <p>Phone: {phone}</p> : null}
            {website ? <p>Website: {website}</p> : null}
          </section>
        </div>

        <p className="mt-12 text-sm text-slate-500">
          <Link to="/terms" className="text-teal-700 font-medium hover:underline">
            Terms &amp; conditions
          </Link>
          {' · '}
          <Link to="/" className="text-teal-700 font-medium hover:underline">
            Home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Privacy
