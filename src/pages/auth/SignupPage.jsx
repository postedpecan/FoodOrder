import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icon } from '../../components/ui/Icon'

export function SignupPage() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signUp(email, password, fullName)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="empty-state empty-state-page">
        <span>✉️</span><h2>Check your email</h2>
        <p>Account created. Confirm your email if required, then log in.</p>
        <Link to="/login" className="button-link">Go to login <Icon name="arrow" size={17} /></Link>
      </div>
    )
  }

  return (
    <div className="auth-layout">
      <section className="auth-promo auth-promo-signup"><Link to="/" className="auth-brand">Food<span>Order</span></Link><div><span className="eyebrow"><Icon name="spark" size={16} />Made for campus</span><h1>Great food fits into your schedule.</h1><p>Create an account, explore nearby places and follow your order in real time.</p></div><div className="auth-food-row"><span>🍱</span><span>🥐</span><span>🍔</span></div></section>
      <section className="auth-page">
      <div className="auth-heading"><span>Get started</span><h2>Create your account</h2><p>Join FoodOrder in under a minute.</p></div>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Full name
          <input type="text" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="primary-wide" disabled={submitting}>
          {submitting ? 'Signing up...' : 'Sign up'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
      </section>
    </div>
  )
}
