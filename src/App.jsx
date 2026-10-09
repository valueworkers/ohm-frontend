import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import AboutSection from './components/AboutSection'
import TenantsList from './components/TenantsList'
import TenantOnboardingForm from './components/TenantOnboardingForm'
import LoginModal from './components/LoginModal'
import './App.css'

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <div className="app">
      <Navbar onLoginClick={() => setIsLoginOpen(true)} />
      <main>
        <Hero />
        <AboutSection />
        <TenantsList />
        <TenantOnboardingForm />
      </main>
      <footer className="site-footer">
        <p>© {new Date().getFullYear()} O-HM. Helping families find senior care.</p>
      </footer>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  )
}

export default App
