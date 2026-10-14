import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero'
import AboutSection from '../components/AboutSection'
import TenantsList from '../components/TenantsList'
import TenantOnboardingForm from '../components/TenantOnboardingForm'

function HomePage() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return undefined

    const id = hash.replace('#', '')
    const target = document.getElementById(id)
    if (!target) return undefined

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return undefined
  }, [hash])

  return (
    <>
      <Hero />
      <AboutSection />
      <TenantsList />
      <TenantOnboardingForm />
    </>
  )
}

export default HomePage
