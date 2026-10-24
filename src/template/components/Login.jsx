import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTenant } from '../tenantContext'
import {
  isTenantAuthenticated,
  saveTenantAuthSession,
  tenantLoginWithOtp,
  tenantLoginWithPassword,
  tenantRequestLoginOtp,
  tenantRequestPasswordResetOtp,
  tenantResetPassword,
} from '../api/tenantAuth'
import { resolveCurrentTenantSlug } from '../../utils/tenantHeader'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { name: brandName } = useTenant()
  const tenantSlug = resolveCurrentTenantSlug()
  const firstFieldRef = useRef(null)

  const [method, setMethod] = useState('password')
  const [view, setView] = useState('login')
  const [statusMessage, setStatusMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [forgotOtpSent, setForgotOtpSent] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ email: '', password: '' })
  const [otpForm, setOtpForm] = useState({ contact: '', otp: '' })
  const [forgotForm, setForgotForm] = useState({
    username: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (isTenantAuthenticated()) {
      navigate('/account', { replace: true })
    }
  }, [navigate])

  async function handlePasswordLogin(event) {
    event.preventDefault()
    setIsLoading(true)
    setIsError(false)
    setStatusMessage('')

    try {
      const result = await tenantLoginWithPassword({
        username: passwordForm.email.trim(),
        password: passwordForm.password,
      })
      saveTenantAuthSession(result)
      setStatusMessage('Signed in successfully.')
      navigate('/account', { replace: true })
    } catch (error) {
      setIsError(true)
      setStatusMessage(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendOtp(event) {
    event.preventDefault()
    const contact = otpForm.contact.trim()
    if (!contact) {
      setIsError(true)
      setStatusMessage('Enter an email or phone number to receive an OTP.')
      return
    }

    setIsLoading(true)
    setIsError(false)
    setStatusMessage('')

    try {
      await tenantRequestLoginOtp({ username: contact })
      setOtpSent(true)
      setStatusMessage(`OTP sent to ${contact}.`)
    } catch (error) {
      setIsError(true)
      setStatusMessage(error.message || 'Could not send OTP.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault()
    const username = otpForm.contact.trim()
    const otp = otpForm.otp.trim()

    if (!otp) {
      setIsError(true)
      setStatusMessage('Enter the OTP you received.')
      return
    }

    setIsLoading(true)
    setIsError(false)
    setStatusMessage('')

    try {
      const result = await tenantLoginWithOtp({ username, otp })
      saveTenantAuthSession(result)
      setStatusMessage('Signed in successfully.')
      navigate('/account', { replace: true })
    } catch (error) {
      setIsError(true)
      setStatusMessage(error.message || 'OTP login failed.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendResetOtp(event) {
    event.preventDefault()
    const username = forgotForm.username.trim()
    if (!username) {
      setIsError(true)
      setStatusMessage('Enter your email or phone number.')
      return
    }

    setIsLoading(true)
    setIsError(false)
    setStatusMessage('')

    try {
      await tenantRequestPasswordResetOtp({ username })
      setForgotOtpSent(true)
      setStatusMessage(`OTP sent to ${username}.`)
    } catch (error) {
      setIsError(true)
      setStatusMessage(error.message || 'Could not send reset OTP.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault()
    const username = forgotForm.username.trim()
    const otp = forgotForm.otp.trim()
    const newPassword = forgotForm.newPassword
    const confirmPassword = forgotForm.confirmPassword

    if (!otp) {
      setIsError(true)
      setStatusMessage('Enter the OTP you received.')
      return
    }
    if (!newPassword) {
      setIsError(true)
      setStatusMessage('Enter a new password.')
      return
    }
    if (newPassword !== confirmPassword) {
      setIsError(true)
      setStatusMessage('Passwords do not match.')
      return
    }

    setIsLoading(true)
    setIsError(false)
    setStatusMessage('')

    try {
      await tenantResetPassword({ username, otp, newPassword })
      setStatusMessage('Password updated. You can sign in now.')
      setForgotOtpSent(false)
      setForgotForm({
        username,
        otp: '',
        newPassword: '',
        confirmPassword: '',
      })
      setView('login')
      setMethod('password')
      setPasswordForm((prev) => ({ ...prev, email: username, password: '' }))
    } catch (error) {
      setIsError(true)
      setStatusMessage(error.message || 'Could not reset password.')
    } finally {
      setIsLoading(false)
    }
  }

  function openForgot() {
    setView('forgot')
    setForgotOtpSent(false)
    setForgotForm({
      username: passwordForm.email.trim(),
      otp: '',
      newPassword: '',
      confirmPassword: '',
    })
    setStatusMessage('')
    setIsError(false)
  }

  return (
    <section className="tenant-login-page" aria-labelledby="tenant-login-title">
      <div className="tenant-login-card">
        <p className="tenant-login-eyebrow">{brandName || 'Care provider'}</p>
        <h1 id="tenant-login-title">
          {view === 'forgot' ? 'Reset password' : 'Sign in'}
        </h1>
        <p className="tenant-login-lead">
          {view === 'forgot'
            ? forgotOtpSent
              ? 'Enter the OTP and choose a new password.'
              : 'We will send an OTP to your email or phone.'
            : tenantSlug
              ? `Sign in to ${tenantSlug}.o-hm.com with password or OTP.`
              : 'Sign in with password or OTP.'}
        </p>

        {!tenantSlug ? (
          <p className="tenant-login-status is-error" role="alert">
            Tenant slug is missing. Open this site from My tenants so requests can
            send the X-Tenant header.
          </p>
        ) : null}

        {view === 'login' ? (
          <>
            <div className="tenant-login-tabs" role="tablist" aria-label="Login method">
              <button
                type="button"
                role="tab"
                aria-selected={method === 'password'}
                className={method === 'password' ? 'is-active' : ''}
                onClick={() => {
                  setMethod('password')
                  setStatusMessage('')
                  setIsError(false)
                }}
              >
                Password
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={method === 'otp'}
                className={method === 'otp' ? 'is-active' : ''}
                onClick={() => {
                  setMethod('otp')
                  setStatusMessage('')
                  setIsError(false)
                  setOtpSent(false)
                }}
              >
                OTP
              </button>
            </div>

            {method === 'password' ? (
              <form className="tenant-login-form" onSubmit={handlePasswordLogin}>
                <div className="tenant-login-field">
                  <label htmlFor="tenant-login-email">Email</label>
                  <input
                    ref={firstFieldRef}
                    id="tenant-login-email"
                    type="email"
                    required
                    autoComplete="username"
                    value={passwordForm.email}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="tenant-login-field">
                  <label htmlFor="tenant-login-password">Password</label>
                  <input
                    id="tenant-login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={passwordForm.password}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                  />
                </div>
                <button type="button" className="tenant-login-link" onClick={openForgot}>
                  Forgot?
                </button>
                <button
                  type="submit"
                  className="tenant-login-submit"
                  disabled={isLoading || !tenantSlug}
                >
                  {isLoading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            ) : (
              <form
                className="tenant-login-form"
                onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
              >
                <div className="tenant-login-field">
                  <label htmlFor="tenant-otp-contact">Email / phone</label>
                  <input
                    id="tenant-otp-contact"
                    type="text"
                    required
                    autoComplete="username"
                    value={otpForm.contact}
                    disabled={otpSent || isLoading}
                    onChange={(event) =>
                      setOtpForm((prev) => ({
                        ...prev,
                        contact: event.target.value,
                      }))
                    }
                  />
                </div>
                {otpSent ? (
                  <div className="tenant-login-field">
                    <label htmlFor="tenant-otp-code">OTP</label>
                    <input
                      id="tenant-otp-code"
                      type="text"
                      inputMode="numeric"
                      required
                      autoComplete="one-time-code"
                      value={otpForm.otp}
                      onChange={(event) =>
                        setOtpForm((prev) => ({ ...prev, otp: event.target.value }))
                      }
                    />
                  </div>
                ) : null}
                <button
                  type="submit"
                  className="tenant-login-submit"
                  disabled={isLoading || !tenantSlug}
                >
                  {isLoading
                    ? otpSent
                      ? 'Verifying…'
                      : 'Sending…'
                    : otpSent
                      ? 'Verify & sign in'
                      : 'Send OTP'}
                </button>
                {otpSent ? (
                  <button
                    type="button"
                    className="tenant-login-link"
                    onClick={() => {
                      setOtpSent(false)
                      setOtpForm((prev) => ({ ...prev, otp: '' }))
                      setStatusMessage('')
                      setIsError(false)
                    }}
                  >
                    Change contact
                  </button>
                ) : null}
              </form>
            )}
          </>
        ) : (
          <form
            className="tenant-login-form"
            onSubmit={forgotOtpSent ? handleResetPassword : handleSendResetOtp}
          >
            <div className="tenant-login-field">
              <label htmlFor="tenant-forgot-username">Email / phone</label>
              <input
                id="tenant-forgot-username"
                type="text"
                required
                value={forgotForm.username}
                disabled={forgotOtpSent || isLoading}
                onChange={(event) =>
                  setForgotForm((prev) => ({
                    ...prev,
                    username: event.target.value,
                  }))
                }
              />
            </div>
            {forgotOtpSent ? (
              <>
                <div className="tenant-login-field">
                  <label htmlFor="tenant-forgot-otp">OTP</label>
                  <input
                    id="tenant-forgot-otp"
                    type="text"
                    inputMode="numeric"
                    required
                    value={forgotForm.otp}
                    onChange={(event) =>
                      setForgotForm((prev) => ({ ...prev, otp: event.target.value }))
                    }
                  />
                </div>
                <div className="tenant-login-field">
                  <label htmlFor="tenant-forgot-new">New password</label>
                  <input
                    id="tenant-forgot-new"
                    type="password"
                    required
                    value={forgotForm.newPassword}
                    onChange={(event) =>
                      setForgotForm((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="tenant-login-field">
                  <label htmlFor="tenant-forgot-confirm">Confirm password</label>
                  <input
                    id="tenant-forgot-confirm"
                    type="password"
                    required
                    value={forgotForm.confirmPassword}
                    onChange={(event) =>
                      setForgotForm((prev) => ({
                        ...prev,
                        confirmPassword: event.target.value,
                      }))
                    }
                  />
                </div>
              </>
            ) : null}
            <button
              type="submit"
              className="tenant-login-submit"
              disabled={isLoading || !tenantSlug}
            >
              {isLoading
                ? forgotOtpSent
                  ? 'Updating…'
                  : 'Sending…'
                : forgotOtpSent
                  ? 'Update password'
                  : 'Send OTP'}
            </button>
            <button
              type="button"
              className="tenant-login-link"
              onClick={() => {
                setView('login')
                setStatusMessage('')
                setIsError(false)
              }}
            >
              Back to sign in
            </button>
          </form>
        )}

        {statusMessage ? (
          <p
            className={`tenant-login-status${isError ? ' is-error' : ''}`}
            role="status"
          >
            {statusMessage}
          </p>
        ) : null}

        <p className="tenant-login-back">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </section>
  )
}

export default Login
