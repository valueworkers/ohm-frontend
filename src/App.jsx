import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthSessionListener from './components/AuthSessionListener'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/tenants/:tenantId" element={<TenantDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="site-footer">
          <p>© {new Date().getFullYear()} O-HM. Helping families find senior care.</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
