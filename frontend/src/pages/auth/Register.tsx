/**
 * frontend/src/pages/auth/Register.tsx
 * Registration page with full validation and password strength indicator.
 */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RegisterProps {
  onNavigate: (path: string) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 2 + i);

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

export function Register({ onNavigate }: RegisterProps) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    college: '',
    department: '',
    graduation_year: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) errs.full_name = 'Please enter your full name.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match.';
    if (form.graduation_year && (parseInt(form.graduation_year) < 2000 || parseInt(form.graduation_year) > 2040))
      errs.graduation_year = 'Please select a valid graduation year.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    setApiError('');
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
        role: form.role,
      };
      if (form.college.trim()) payload.college = form.college.trim();
      if (form.department.trim()) payload.department = form.department.trim();
      if (form.graduation_year) payload.graduation_year = parseInt(form.graduation_year);

      const msg = await register(payload as never);
      setSuccessMsg(msg);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMsg) {
    return (
      <div className="auth-page auth-center">
        <div className="auth-form-card auth-success-card">
          <div className="auth-success-icon">✉️</div>
          <h2>Verify your email</h2>
          <p className="auth-brand-tagline">{successMsg}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Didn't receive it? Check your spam folder.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}
            onClick={() => onNavigate('login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-icon">🎓</div>
          <h1 className="auth-brand-title">Student Placement Analyzer</h1>
          <p className="auth-brand-tagline">Join thousands of students accelerating their careers with data-driven insights.</p>
          <ul className="auth-brand-features">
            <li>🔮 Know your placement probability</li>
            <li>🧩 Discover your skill gaps</li>
            <li>🗺️ Get a personalized learning roadmap</li>
            <li>📈 Track your career progress</li>
          </ul>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card auth-form-card-register">
          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Start your career journey today</p>
          </div>

          {apiError && (
            <div className="auth-alert auth-alert-error" role="alert">
              <span>⚠️</span> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name *</label>
                <input id="reg-name" type="text" className={`form-input ${errors.full_name ? 'input-error' : ''}`}
                  placeholder="Jane Smith" value={form.full_name} onChange={set('full_name')}
                  autoComplete="name" disabled={isSubmitting} />
                {errors.full_name && <span className="field-error">{errors.full_name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address *</label>
                <input id="reg-email" type="email" className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="jane@university.edu" value={form.email} onChange={set('email')}
                  autoComplete="email" disabled={isSubmitting} />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password *</label>
                <div className="input-with-icon">
                  <input id="reg-password" type={showPassword ? 'text' : 'password'}
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    placeholder="Create a strong password" value={form.password} onChange={set('password')}
                    autoComplete="new-password" disabled={isSubmitting} />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide' : 'Show'}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
                <PasswordStrength password={form.password} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm Password *</label>
                <div className="input-with-icon">
                  <input id="reg-confirm" type={showConfirm ? 'text' : 'password'}
                    className={`form-input ${errors.confirm_password ? 'input-error' : ''}`}
                    placeholder="Repeat your password" value={form.confirm_password} onChange={set('confirm_password')}
                    autoComplete="new-password" disabled={isSubmitting} />
                  <button type="button" className="toggle-password" onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? 'Hide' : 'Show'}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirm_password && <span className="field-error">{errors.confirm_password}</span>}
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-college">College / Institution</label>
                <input id="reg-college" type="text" className="form-input"
                  placeholder="IIT Bombay, BITS Pilani…" value={form.college} onChange={set('college')}
                  disabled={isSubmitting} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-dept">Department / Branch</label>
                <input id="reg-dept" type="text" className="form-input"
                  placeholder="Computer Science, MBA…" value={form.department} onChange={set('department')}
                  disabled={isSubmitting} />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-grad">Graduation Year</label>
                <select id="reg-grad" className="form-select" value={form.graduation_year} onChange={set('graduation_year')} disabled={isSubmitting}>
                  <option value="">Select year</option>
                  {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.graduation_year && <span className="field-error">{errors.graduation_year}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-role">Account Type</label>
                <select id="reg-role" className="form-select" value={form.role} onChange={set('role')} disabled={isSubmitting}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <><span className="btn-spinner" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch-text">
            Already have an account?{' '}
            <button type="button" className="auth-link-btn" onClick={() => onNavigate('login')}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
