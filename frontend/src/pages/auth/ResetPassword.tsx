/**
 * frontend/src/pages/auth/ResetPassword.tsx
 */
import { useState } from 'react';
import { API_BASE } from '../../config';

interface ResetPasswordProps {
  onNavigate: (path: string) => void;
  token?: string;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Minimum 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Special character', ok: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const label = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][score];
  const colorClass = ['', 'str-1', 'str-2', 'str-3', 'str-4', 'str-5'][score];
  if (!password) return null;
  return (
    <div className="password-strength">
      <div className="strength-bar-row">
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} className={`strength-segment ${n <= score ? colorClass : ''}`} />
        ))}
        <span className={`strength-label ${colorClass}`}>{label}</span>
      </div>
      <ul className="strength-checks">
        {checks.map(c => (
          <li key={c.label} className={c.ok ? 'check-ok' : 'check-fail'}>
            {c.ok ? '✓' : '✗'} {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResetPassword({ onNavigate, token }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resolvedToken = token || new URLSearchParams(window.location.search).get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) { setError('Please enter a new password.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!resolvedToken) { setError('Invalid or missing reset token.'); return; }

    setIsSubmitting(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resolvedToken, new_password: newPassword, confirm_password: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.detail;
        throw new Error(Array.isArray(detail) ? detail.map((e: { msg: string }) => e.msg).join(' ') : detail || 'Reset failed.');
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!resolvedToken) {
    return (
      <div className="auth-page auth-center">
        <div className="auth-form-card">
          <div className="auth-alert auth-alert-error">⚠️ Invalid or missing password reset link. Please request a new one.</div>
          <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}
            onClick={() => onNavigate('forgot-password')}>Request New Link</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page auth-center">
      <div className="auth-form-card">
        <div className="auth-form-header">
          <div className="auth-brand-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔐</div>
          <h2>Reset your password</h2>
          <p>Enter a new strong password for your account.</p>
        </div>

        {success ? (
          <>
            <div className="auth-alert auth-alert-success">✅ Your password has been reset successfully.</div>
            <button className="btn btn-primary" style={{ marginTop: '1.25rem', width: '100%' }}
              onClick={() => onNavigate('login')}>Go to Login</button>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-alert auth-alert-error">⚠️ {error}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="reset-new-pw">New Password</label>
              <div className="input-with-icon">
                <input id="reset-new-pw" type={showNew ? 'text' : 'password'} className="form-input"
                  placeholder="Create a strong password" value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setError(''); }}
                  autoComplete="new-password" disabled={isSubmitting} />
                <button type="button" className="toggle-password" onClick={() => setShowNew(v => !v)}>
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
              <PasswordStrength password={newPassword} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm-pw">Confirm Password</label>
              <div className="input-with-icon">
                <input id="reset-confirm-pw" type={showConfirm ? 'text' : 'password'} className="form-input"
                  placeholder="Repeat your password" value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  autoComplete="new-password" disabled={isSubmitting} />
                <button type="button" className="toggle-password" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <><span className="btn-spinner" /> Resetting...</> : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
