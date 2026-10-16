import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthSessionListener from './components/AuthSessionListener'
import Navbar from './components/Navbar'
import SiteFooter from './components/SiteFooter'
import BookCarePage from './pages/BookCarePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import PricingPage from './pages/PricingPage'
import TenantDetailPage from './pages/TenantDetailPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <AuthSessionListener />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book-care" element={<BookCarePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/tenants/:tenantId" element={<TenantDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  )
}

export default App
