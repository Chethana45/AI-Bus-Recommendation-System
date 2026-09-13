import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bus, Eye, EyeOff, Lock, Mail, Phone, Sparkles, UserRound } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
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
    setErrors({});
    setSuccessMessage('');
    try {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
        password: formData.password,
      };

      const response = await api.post('/auth/register', payload);

      const message = response?.data?.message || 'Registration successful. Please login.';
      setSuccessMessage(message);

      // If backend returns a token, you may store it (optional)
      const token = response?.data?.token || response?.data?.authToken;
      if (token) {
        localStorage.setItem('authToken', token);
        // Dispatch custom event to notify Navbar of login
        window.dispatchEvent(new Event('authChange'));
        // If token is returned, user is auto-logged in, redirect to home
        setTimeout(() => {
          navigate('/');
        }, 900);
      } else {
        // No token returned, redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 900);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const resp = error?.response?.data;
      const message = resp?.message || resp?.error || 'Registration failed. Please try again.';
      // If backend returns field errors, map them to form fields
      if (resp && typeof resp === 'object' && resp.errors) {
        const fieldErrors = {};
        resp.errors.forEach((err) => {
          if (err.param) fieldErrors[err.param] = err.msg || err.message;
        });
        setErrors(fieldErrors);
      }
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = [
    { label: '8+ characters', met: formData.password.length >= 8 },
    { label: 'Uppercase & lowercase', met: /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) },
    { label: 'At least one number', met: /\d/.test(formData.password) },
  ];

  return (
    <div className="auth-container">
      <div className="auth-card auth-card--register">
        <div className="auth-brand">
          <div className="auth-icon-badge">
            <Bus size={20} />
            <span className="auth-badge-accent"><Sparkles size={10} /></span>
          </div>
          <div className="auth-brand-text">
            <p className="auth-eyebrow">BusBook</p>
            <h1>Create your account</h1>
          </div>
          <p className="auth-subtitle">Your next trip is closer.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <div className="auth-input-group">
            <label htmlFor="fullName">Full name</label>
            <div className={`auth-input-shell ${errors.fullName ? 'has-error' : ''}`}>
              <UserRound size={16} className="auth-icon" />
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
            {errors.fullName && (
              <span className="error-text">{errors.fullName}</span>
            )}
          </div>

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
            <label htmlFor="phoneNumber">Phone number</label>
            <div className={`auth-input-shell ${errors.phoneNumber ? 'has-error' : ''}`}>
              <Phone size={16} className="auth-icon" />
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="10-digit phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
            {errors.phoneNumber && (
              <span className="error-text">{errors.phoneNumber}</span>
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
                placeholder="Create a password"
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
            <div className="password-hint-list">
              {passwordChecks.map((item) => (
                <span key={item.label} className={`password-hint-item ${item.met ? 'is-met' : ''}`}>
                  <span className="password-hint-bullet">{item.met ? '✓' : '•'}</span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className={`auth-input-shell ${errors.confirmPassword ? 'has-error' : ''}`}>
              <Lock size={16} className="auth-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="auth-visibility-btn"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <label htmlFor="terms" className={`auth-checkbox-row ${errors.terms ? 'has-error' : ''}`}>
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => {
                setAgreeToTerms(e.target.checked);
                if (errors.terms) {
                  setErrors({
                    ...errors,
                    terms: '',
                  });
                }
              }}
              className="auth-checkbox"
            />
            <span>
              I agree to the{' '}
              <a href="#" className="link">Terms & Conditions</a>
            </span>
          </label>
          {errors.terms && (
            <span className="error-text">{errors.terms}</span>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
