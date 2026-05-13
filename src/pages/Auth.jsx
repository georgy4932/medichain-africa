import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import InlineError from '../components/shared/InlineError'

export default function AuthPage() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const { signIn, signUp } = useAuth()

  function switchMode(nextMode) {
    setMode(nextMode)
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError(null)
    setSuccess(null)
    setLoading(true)

    if (mode === 'signup' && !fullName.trim()) {
      setError('Full name is required.')
      setLoading(false)
      return
    }

    const authError =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, fullName.trim())

    if (authError) {
      setError(authError.message)
    } else if (mode === 'signup') {
      setSuccess('Account created. Check your email to confirm, then sign in.')
    }

    setLoading(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-panel fade-up">
        <div className="auth-brand">
          <div className="brand-mark">MC</div>
          <div>
            <h1>MediChain</h1>
            <p>Africa Pharmacy Supply Intelligence</p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>{mode === 'signin' ? 'Welcome back' : 'Create account'}</h2>
            <p>
              {mode === 'signin'
                ? 'Sign in to access your facility command centre.'
                : 'Create your account to begin managing facility inventory.'}
            </p>
          </div>

          <InlineError message={error} />

          {success && (
            <div className="alert-banner alert-banner-success" role="status">
              <div className="alert-icon alert-icon-success">✓</div>
              <div className="alert-message alert-message-success">
                {success}
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Dr. Amaka Obi"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@facility.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Processing…
                </>
              ) : mode === 'signin' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'signin' ? (
              <>
                No account?
                <button type="button" onClick={() => switchMode('signup')}>
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?
                <button type="button" onClick={() => switchMode('signin')}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
