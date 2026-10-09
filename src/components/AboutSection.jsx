import { useReveal } from '../hooks/useReveal'
import './AboutSection.css'

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
        <h2 id="about-heading">About Us</h2>
        <p className="about-lead">
          O-HM is an aggregator for senior care providers. We give families a clearer
          path to compare communities, and we give providers a shared platform for
          discovery, referrals, and their own branded web presence.
        </p>
        <ul className="about-points">
          <li className="about-point reveal-delay-1">
            <strong>For families</strong>
            Search and compare assisted living, memory care, home care, and more in
            one directory.
          </li>
          <li className="about-point reveal-delay-2">
            <strong>For providers</strong>
            Join as a tenant, claim your profile, and optionally launch a site on
            your own O-HM subdomain.
          </li>
          <li className="about-point reveal-delay-3">
            <strong>For operators</strong>
            Add an ops admin when you need a separate contact for day-to-day platform
            support.
          </li>
        </ul>
      </div>
    </section>
  )
}

export default AboutSection
