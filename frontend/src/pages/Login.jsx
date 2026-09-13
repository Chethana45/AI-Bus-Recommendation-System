import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bus, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const token = response?.data?.token || response?.data?.authToken;
      if (token) {
        localStorage.setItem('authToken', token);
      }

      // Optionally save user info if returned
      if (response?.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Dispatch custom event to notify Navbar of login
      window.dispatchEvent(new Event('authChange'));

      setErrors({});
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const message =
        error?.response?.data?.message || error?.response?.data?.error || 'Login failed. Please check your credentials and try again.';
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card--login">
        <div className="auth-brand">
          <div className="auth-icon-badge">
            <Bus size={20} />
            <span className="auth-badge-accent"><Sparkles size={10} /></span>
          </div>
          <div className="auth-brand-text">
            <p className="auth-eyebrow">BusBook</p>
            <h1>Welcome back</h1>
          </div>
          <p className="auth-subtitle">Your journey is waiting.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="auth-input-group">
            <label htmlFor="email">Email address</label>
            <div className={`auth-input-shell ${errors.email ? 'has-error' : ''}`}>
              <Mail size={16} className="auth-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <div className={`auth-input-shell ${errors.password ? 'has-error' : ''}`}>
              <Lock size={16} className="auth-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="auth-visibility-btn"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-actions">
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner" />
                Logging in...
              </>
            ) : (
              <>
                Login
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New here?{' '}
            <Link to="/register" className="auth-link">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
