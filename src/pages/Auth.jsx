import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { InlineError } from '../components/shared'

export default function AuthPage() {
  const [mode,     setMode]     = useState('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [success,  setSuccess]  = useState(null)
  const { signIn, signUp }      = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null); setSuccess(null); setLoading(true)
    if (mode === 'signin') {
      const err = await signIn(email, password)
      if (err) setError(err.message)
    } else {
      if (!fullName.trim()) { setError('Full name is required.'); setLoading(false); return }
      const err = await signUp(email, password, fullName)
      if (err) setError(err.message)
      else setSuccess('Account created. Check your email to confirm, then sign in.')
    }
    setLoading(false)
  }

  function switchMode(m) { setMode(m); setError(null); setSuccess(null) }

  return (
    <div className="auth-layout">
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="#07111f" strokeWidth="2.5" style={{width:22,height:22}}>
              <path d="M12 2v20M2 12h20"/>
            </svg>
          </div>
          <span className="auth-brand-name">Orela</span>
          <span className="auth-brand-tag">Africa Pharmacy Supply Intelligence</span>
        </div>

        {/* Card */}
        <div className="auth-surface">
          <div className="auth-title">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </div>
          <div className="auth-subtitle">
            {mode === 'signin'
              ? 'Sign in to access your facility command centre.'
              : 'Set up your facility and start tracking medicine availability.'}
          </div>

          {error   && <InlineError message={error} />}
          {success && (
            <div className="inline-alert alert-success" style={{ marginBottom: 4 }}>
              <span className="inline-alert-icon">✓</span>
              <span>{success}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="field">
                <label>Full name</label>
                <input type="text" placeholder="Dr. Amaka Obi" value={fullName}
                  onChange={e => setFullName(e.target.value)} required autoComplete="name" />
              </div>
            )}

            <div className="field">
              <label>Email address</label>
              <input type="email" placeholder="you@facility.com" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={8}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg"
              disabled={loading} style={{ marginTop: 2 }}>
              {loading
                ? <><div className="spinner spinner-sm" style={{borderTopColor:'#07111f'}}/> Signing in…</>
                : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'signin'
              ? <>No account?{' '}<button onClick={() => switchMode('signup')}>Sign up</button></>
              : <>Have an account?{' '}<button onClick={() => switchMode('signin')}>Sign in</button></>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
