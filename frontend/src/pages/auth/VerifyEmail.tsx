/**
 * frontend/src/pages/auth/VerifyEmail.tsx
 * Handles the email verification link click.
 */
import { useEffect, useState } from 'react';
import { API_BASE } from '../../config';

interface VerifyEmailProps {
  onNavigate: (path: string) => void;
  token?: string;
}

export function VerifyEmail({ onNavigate, token }: VerifyEmailProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const resolvedToken = token || new URLSearchParams(window.location.search).get('token') || '';

  useEffect(() => {
    if (!resolvedToken) {
      setStatus('error');
      setMessage('Invalid verification link. Please request a new one.');
      return;
    }
    fetch(`${API_BASE}/api/auth/verify-email?token=${encodeURIComponent(resolvedToken)}`, { method: 'POST' })
      .then(async res => {
        const data = await res.json();
        if (res.ok) { setStatus('success'); setMessage(data.message); }
        else { setStatus('error'); setMessage(data.detail || 'Verification failed.'); }
      })
      .catch(() => { setStatus('error'); setMessage('Network error. Please try again.'); });
  }, [resolvedToken]);

  return (
    <div className="auth-page auth-center">
      <div className="auth-form-card" style={{ textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <div className="auth-spinner" style={{ margin: '0 auto 1.5rem' }} />
            <h2>Verifying your email…</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="auth-brand-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2>Email Verified!</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{message}</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}
              onClick={() => onNavigate('login')}>Go to Login</button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="auth-brand-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2>Verification Failed</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{message}</p>
            <button className="btn btn-secondary" style={{ marginTop: '1.5rem', width: '100%' }}
              onClick={() => onNavigate('login')}>Back to Login</button>
          </>
        )}
      </div>
    </div>
  );
}
