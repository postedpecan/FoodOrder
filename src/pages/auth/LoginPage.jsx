import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icon } from '../../components/ui/Icon'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-promo"><Link to="/" className="auth-brand">Food<span>Order</span></Link><div><span className="eyebrow"><Icon name="spark" size={16} />Welcome back</span><h1>Your next campus favorite is a few taps away.</h1><p>Discover local kitchens, order ahead and spend less time waiting in line.</p></div><div className="auth-food-row"><span>🍜</span><span>🍕</span><span>🥗</span></div></section>
      <section className="auth-page">
      <div className="auth-heading"><span>Welcome back</span><h2>Log in to FoodOrder</h2><p>Enter your details to continue.</p></div>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="primary-wide" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="auth-switch">
        No account? <Link to="/signup">Sign up</Link>
      </p>
      </section>
    </div>
  )
}
