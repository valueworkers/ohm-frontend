import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FORCE_LOGOUT_EVENT } from '../api/session'

function AuthSessionListener() {
  const navigate = useNavigate()

  useEffect(() => {
    function handleForceLogout() {
      navigate('/login', { replace: true })
    }

    window.addEventListener(FORCE_LOGOUT_EVENT, handleForceLogout)
    return () => window.removeEventListener(FORCE_LOGOUT_EVENT, handleForceLogout)
  }, [navigate])

  return null
}

export default AuthSessionListener
