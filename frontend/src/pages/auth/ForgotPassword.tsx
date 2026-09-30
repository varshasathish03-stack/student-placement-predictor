/**
 * frontend/src/pages/auth/ForgotPassword.tsx
 */
import React, { useState } from 'react';
import { API_BASE } from '../../config';

interface ForgotPasswordProps {
  onNavigate: (path: string) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setIsSubmitting(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Request failed.');
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-center">
      <div className="auth-form-card">
        <div className="auth-form-header">
          <div className="auth-brand-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔑</div>
          <h2>Forgot your password?</h2>
          <p>Enter your registered email address and we'll send you a reset link.</p>
        </div>

        {submitted ? (
          <div className="auth-alert auth-alert-success">
            <p>✅ If an account exists for <strong>{email}</strong>, we've sent password reset instructions. Check your inbox (and spam folder).</p>
            <button className="btn btn-primary" style={{ marginTop: '1.25rem', width: '100%' }}
              onClick={() => onNavigate('login')}>
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-alert auth-alert-error">⚠️ {error}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Email address</label>
              <input
                id="forgot-email"
                type="email"
                className="form-input"
                placeholder="you@university.edu"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>
            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <><span className="btn-spinner" /> Sending...</> : 'Send Reset Link'}
            </button>
          </form>
        )}

        {!submitted && (
          <p className="auth-switch-text">
            <button type="button" className="auth-link-btn" onClick={() => onNavigate('login')}>
              ← Back to Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
