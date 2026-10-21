import { Link } from 'react-router-dom'
import { useTenant } from '../tenantContext'

const DEFAULT_SERVICES = [
  'Home nursing and caregiver support',
  'In-facility and premises care',
  'Post-surgical and recovery care',
  'Elder and assisted living support',
  'Care coordination for families',
]

const DEFAULT_VALUES = [
  {
    title: 'Compassion',
    body: 'Care that respects dignity, comfort, and the people around each patient.',
  },
  {
    title: 'Professionalism',
    body: 'Trained caregivers, clear processes, and accountable service delivery.',
  },
  {
    title: 'Transparency',
    body: 'Clear communication on plans, staffing, and what families can expect.',
  },
  {
    title: 'Reliability',
    body: 'Dependable support that fits clinical needs and family schedules.',
  },
]

const About = () => {
  const { name, description, email, phone, website, logo, profile } = useTenant()
  const brandName = name || 'Care provider'
  const aboutText =
    description ||
    profile?.raw?.about ||
    `${brandName} provides professional senior care and nursing support for families — at home and in care facilities.`
  const address =
    profile?.raw?.address ||
    profile?.raw?.address_line_1 ||
    [profile?.raw?.locality, profile?.raw?.city, profile?.raw?.pincode]
      .filter(Boolean)
      .join(', ') ||
    null

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-teal-600 font-semibold uppercase tracking-[0.2em] text-xs">
          {brandName}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
          About us
        </h1>
        <p className="mt-3 text-slate-600 text-lg max-w-3xl">{aboutText}</p>

        {logo ? (
          <div className="mt-8">
            <img
              src={logo}
              alt={`${brandName} logo`}
              className="h-16 w-auto object-contain"
            />
          </div>
        ) : null}

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Who we are</h2>
          <div className="mt-4 text-slate-600 space-y-4 text-[15px] leading-relaxed">
            <p>
              {brandName} helps families arrange dependable senior care with trained
              professionals. Whether you need support at home or at a care premises,
              our goal is clear, compassionate service that fits your needs.
            </p>
            <p>
              This page will show richer organization details as they become available
              from your tenant profile — including story, locations, and service focus.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">What we do</h2>
          <p className="mt-4 text-slate-600 text-[15px] leading-relaxed">
            Typical services offered through this care workspace:
          </p>
          <ul className="mt-3 list-disc pl-5 text-slate-600 space-y-2 text-[15px] leading-relaxed">
            {DEFAULT_SERVICES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Our values</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {DEFAULT_VALUES.map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-slate-600 text-[15px] leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Get in touch</h2>
          <div className="mt-4 text-slate-600 space-y-1 text-[15px] leading-relaxed">
            <p className="font-medium text-slate-800">{brandName}</p>
            {address ? <p>{address}</p> : null}
            {phone ? <p>Phone: {phone}</p> : null}
            {email ? (
              <p>
                Email:{' '}
                <a className="text-teal-700 hover:underline" href={`mailto:${email}`}>
                  {email}
                </a>
              </p>
            ) : null}
            {website ? <p>Website: {website}</p> : null}
            {!address && !phone && !email && !website ? (
              <p>Contact details will appear here once they are set for this tenant.</p>
            ) : null}
          </div>
        </section>

        <div className="mt-10 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Book care</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Link
              to="/senior-care"
              className="rounded-xl bg-slate-900 px-4 py-4 text-white text-[20px] leading-tight hover:bg-slate-800 transition-colors"
            >
              Senior care at home
            </Link>
            <Link
              to="/in-house"
              className="rounded-xl bg-slate-900 px-4 py-4 text-white text-[20px] leading-tight hover:bg-slate-800 transition-colors"
            >
              In-house &amp; premises care
            </Link>
          </div>
          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
