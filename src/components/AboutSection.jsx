import { useReveal } from '../hooks/useReveal'
import './AboutSection.css'

const POINTS = [
  {
    title: 'For families',
    text: 'Search and compare assisted living, memory care, home care, and more in one directory.',
  },
  {
    title: 'For providers',
    text: 'Join as a tenant, claim your profile, and optionally launch a site on your own O-HM subdomain.',
  },
  {
    title: 'For operators',
    text: 'Add an ops admin when you need a separate contact for day-to-day platform support.',
  },
]

function AboutSection() {
  const sectionRef = useReveal()

  return (
    <section
      id="about"
      className="about reveal"
      ref={sectionRef}
      aria-labelledby="about-heading"
    >
      <div className="about-inner">
        <p className="section-eyebrow">About O-HM</p>
        <h2 id="about-heading">Built for senior care networks</h2>
        <p className="about-lead">
          O-HM is an aggregator for senior care providers. Families get a clearer path
          to compare options; providers get discovery, referrals, and a branded web
          presence under one roof.
        </p>
        <ul className="about-points">
          {POINTS.map((point, index) => (
            <li
              key={point.title}
              className={`about-point reveal-delay-${index + 1}`}
            >
              <span className="about-point-num" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <strong>{point.title}</strong>
              <p>{point.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default AboutSection
