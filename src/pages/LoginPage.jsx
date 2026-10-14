import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  isAuthenticated,
  loginWithOtp,
  loginWithPassword,
  requestLoginOtp,
  requestPasswordResetOtp,
  resetPassword,
  saveAuthSession,
} from '../api/auth'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const firstFieldRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true })
    }
  }, [navigate])

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

  async function handlePasswordLogin(event) {
    event.preventDefault()
    setIsLoading(true)
    setIsError(false)
    setStatusMessage('')

    try {
      const result = await loginWithPassword({
        username: passwordForm.email.trim(),
        password: passwordForm.password,
      })
      saveAuthSession(result)
      setStatusMessage('Signed in successfully.')
      navigate('/', { replace: true })
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
      await requestLoginOtp({ username: contact })
      setOtpSent(true)
      setStatusMessage(`OTP sent to ${contact}.`)
    } catch (error) {
      setIsError(true)
      setStatusMessage(error.message || 'Could not send OTP. Please try again.')
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
      const result = await loginWithOtp({ username, otp })
      saveAuthSession(result)
      setStatusMessage('Signed in successfully.')
      navigate('/', { replace: true })
    } catch (error) {
      setIsError(true)
      setStatusMessage(error.message || 'OTP login failed. Please try again.')
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
      await requestPasswordResetOtp({ username })
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
      await resetPassword({ username, otp, newPassword })
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

  function showLogin(nextMethod = 'password') {
    setView('login')
    setMethod(nextMethod)
    setStatusMessage('')
    setIsError(false)
    setOtpSent(false)
    setForgotOtpSent(false)
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
    <section className="login-page" aria-labelledby="login-page-title">
      <div className="login-page-card">
        <h1 id="login-page-title">
          {view === 'forgot' ? 'Reset password' : 'Admin login'}
        </h1>
        <p className="login-page-lead">
          {view === 'forgot'
            ? forgotOtpSent
              ? 'Enter the OTP and choose a new password.'
              : 'We will send an OTP to your email or phone.'
            : 'Sign in with password or OTP.'}
        </p>

        {view === 'login' ? (
          <>
            <div className="login-method-tabs" role="tablist" aria-label="Login method">
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
              <form className="login-form" onSubmit={handlePasswordLogin}>
                <div className="login-field">
                  <label htmlFor="login-email">Email</label>
                  <input
                    ref={firstFieldRef}
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="username"
                    value={passwordForm.email}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </div>

                <div className="login-field">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    name="password"
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

                <button type="button" className="login-link-btn" onClick={openForgot}>
                  Forgot?
                </button>

                <button type="submit" className="login-submit" disabled={isLoading}>
                  {isLoading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            ) : (
              <form
                className="login-form"
                onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
              >
                <div className="login-field">
                  <label htmlFor="otp-contact">Email / phone</label>
                  <input
                    ref={firstFieldRef}
                    id="otp-contact"
                    name="contact"
                    type="text"
                    required
                    autoComplete="username"
                    inputMode="email"
                    placeholder="name@email.com or mobile number"
                    value={otpForm.contact}
                    disabled={otpSent || isLoading}
                    onChange={(event) =>
                      setOtpForm((prev) => ({ ...prev, contact: event.target.value }))
                    }
                  />
                </div>

                {otpSent ? (
                  <div className="login-field">
                    <label htmlFor="otp-code">OTP</label>
                    <input
                      id="otp-code"
                      name="otp"
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

                <button type="submit" className="login-submit" disabled={isLoading}>
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
                    className="login-link-btn"
                    disabled={isLoading}
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
            className="login-form"
            onSubmit={forgotOtpSent ? handleResetPassword : handleSendResetOtp}
          >
            <div className="login-field">
              <label htmlFor="forgot-username">Email / phone</label>
              <input
                ref={firstFieldRef}
                id="forgot-username"
                name="username"
                type="text"
                required
                autoComplete="username"
                value={forgotForm.username}
                disabled={forgotOtpSent || isLoading}
                onChange={(event) =>
                  setForgotForm((prev) => ({ ...prev, username: event.target.value }))
                }
              />
            </div>

            {forgotOtpSent ? (
              <>
                <div className="login-field">
                  <label htmlFor="forgot-otp">OTP</label>
                  <input
                    id="forgot-otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    required
                    autoComplete="one-time-code"
                    value={forgotForm.otp}
                    onChange={(event) =>
                      setForgotForm((prev) => ({ ...prev, otp: event.target.value }))
                    }
                  />
                </div>

                <div className="login-field">
                  <label htmlFor="forgot-new-password">New password</label>
                  <input
                    id="forgot-new-password"
                    name="newPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={forgotForm.newPassword}
                    onChange={(event) =>
                      setForgotForm((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="login-field">
                  <label htmlFor="forgot-confirm-password">Confirm password</label>
                  <input
                    id="forgot-confirm-password"
                    name="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
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

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading
                ? forgotOtpSent
                  ? 'Updating…'
                  : 'Sending…'
                : forgotOtpSent
                  ? 'Update password'
                  : 'Send OTP'}
            </button>

            {forgotOtpSent ? (
              <button
                type="button"
                className="login-link-btn"
                disabled={isLoading}
                onClick={() => {
                  setForgotOtpSent(false)
                  setForgotForm((prev) => ({
                    ...prev,
                    otp: '',
                    newPassword: '',
                    confirmPassword: '',
                  }))
                  setStatusMessage('')
                  setIsError(false)
                }}
              >
                Change contact
              </button>
            ) : (
              <button
                type="button"
                className="login-link-btn"
                disabled={isLoading}
                onClick={() => showLogin('password')}
              >
                Back
              </button>
            )}
          </form>
        )}

        {statusMessage ? (
          <p
            className={`login-status${isError ? ' is-error' : ''}`}
            role="status"
          >
            {statusMessage}
          </p>
        ) : null}

        <p className="login-page-back">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </section>
  )
}

export default LoginPage
