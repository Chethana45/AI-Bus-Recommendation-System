import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    try {
      setLoading(true)
      await api.post('/auth/forgot-password', { email })
      setMessage('If the email exists, a password reset link has been sent.')
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('Unable to process request. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your email address and we will send a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remembered your password?{' '}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
