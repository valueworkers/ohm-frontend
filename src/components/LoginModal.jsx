import { useEffect, useId, useRef, useState } from 'react'
import './LoginModal.css'

function LoginModal({ isOpen, onClose }) {
  const titleId = useId()
  const firstFieldRef = useRef(null)
  const [method, setMethod] = useState('password')
  const [view, setView] = useState('login')
  const [statusMessage, setStatusMessage] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ email: '', password: '' })
  const [otpForm, setOtpForm] = useState({ contact: '', otp: '' })
  const [forgotEmail, setForgotEmail] = useState('')

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstFieldRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, view, method])

  useEffect(() => {
    if (!isOpen) {
      setMethod('password')
      setView('login')
      setStatusMessage('')
      setOtpSent(false)
      setPasswordForm({ email: '', password: '' })
      setOtpForm({ contact: '', otp: '' })
      setForgotEmail('')
    }
  }, [isOpen])

  if (!isOpen) return null

  function handlePasswordLogin(event) {
    event.preventDefault()
    setStatusMessage(`Signed in as ${passwordForm.email} (demo — no backend yet).`)
  }

  function handleSendOtp(event) {
    event.preventDefault()
    const contact = otpForm.contact.trim()
    if (!contact) {
      setStatusMessage('Enter an email or phone number to receive an OTP.')
      return
    }
    setOtpSent(true)
    setStatusMessage(`OTP sent to ${contact}.`)
  }

  function handleVerifyOtp(event) {
    event.preventDefault()
    setStatusMessage(`OTP verified for ${otpForm.contact.trim()} (demo — no backend yet).`)
  }

  function handleForgotPassword(event) {
    event.preventDefault()
    setStatusMessage(`Password reset link sent to ${forgotEmail}.`)
  }

  function showLogin(nextMethod = 'password') {
    setView('login')
    setMethod(nextMethod)
    setStatusMessage('')
    setOtpSent(false)
  }

  return (
    <div className="login-modal-root" role="presentation">
      <button
        type="button"
        className="login-modal-backdrop"
        aria-label="Close login"
        onClick={onClose}
      />

      <div
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="login-modal-header">
          <h2 id={titleId}>
            {view === 'forgot' ? 'Forgot password' : 'Login'}
          </h2>
          <button type="button" className="login-modal-close" onClick={onClose}>
            Close
          </button>
        </div>

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
                }}
              >
                Email & password
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={method === 'otp'}
                className={method === 'otp' ? 'is-active' : ''}
                onClick={() => {
                  setMethod('otp')
                  setStatusMessage('')
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
                    autoComplete="email"
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
                      setPasswordForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                  />
                </div>

                <button
                  type="button"
                  className="login-link-btn"
                  onClick={() => {
                    setView('forgot')
                    setStatusMessage('')
                  }}
                >
                  Forgot password?
                </button>

                <button type="submit" className="login-submit">
                  Sign in
                </button>
              </form>
            ) : (
              <form
                className="login-form"
                onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
              >
                <div className="login-field">
                  <label htmlFor="otp-contact">Email or phone</label>
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
                    onChange={(event) =>
                      setOtpForm((prev) => ({ ...prev, contact: event.target.value }))
                    }
                  />
                </div>

                {otpSent ? (
                  <div className="login-field">
                    <label htmlFor="otp-code">One-time password</label>
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

                <button type="submit" className="login-submit">
                  {otpSent ? 'Verify OTP' : 'Send OTP'}
                </button>

                {otpSent ? (
                  <button
                    type="button"
                    className="login-link-btn"
                    onClick={() => {
                      setOtpSent(false)
                      setOtpForm((prev) => ({ ...prev, otp: '' }))
                      setStatusMessage('')
                    }}
                  >
                    Change email or phone
                  </button>
                ) : null}
              </form>
            )}
          </>
        ) : (
          <form className="login-form" onSubmit={handleForgotPassword}>
            <p className="login-help">
              Enter your account email and we will send a password reset link.
            </p>

            <div className="login-field">
              <label htmlFor="forgot-email">Email</label>
              <input
                ref={firstFieldRef}
                id="forgot-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
              />
            </div>

            <button type="submit" className="login-submit">
              Send reset link
            </button>

            <button
              type="button"
              className="login-link-btn"
              onClick={() => showLogin('password')}
            >
              Back to login
            </button>
          </form>
        )}

        {statusMessage ? (
          <p className="login-status" role="status">
            {statusMessage}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default LoginModal
