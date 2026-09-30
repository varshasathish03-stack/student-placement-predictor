/**
 * frontend/src/pages/auth/Profile.tsx
 * User profile page: view info, edit profile, change password, delete account.
 */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../config';
const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 2 + i);

interface ProfileProps {
  onNavigate: (path: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
  const { user, accessToken, refreshUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'danger'>('info');

  // Profile edit state
  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || '',
    college: user?.college || '',
    department: user?.department || '',
    graduation_year: user?.graduation_year?.toString() || '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password state
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [delErr, setDelErr] = useState('');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  });

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true); setProfileMsg(''); setProfileErr('');
    try {
      const payload: Record<string, unknown> = { full_name: editForm.full_name };
      if (editForm.college) payload.college = editForm.college;
      if (editForm.department) payload.department = editForm.department;
      if (editForm.graduation_year) payload.graduation_year = parseInt(editForm.graduation_year);

      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT', headers: authHeaders(), credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update profile.');
      await refreshUser();
      setProfileMsg('Profile updated successfully.');
    } catch (err: unknown) {
      setProfileErr(err instanceof Error ? err.message : 'Update failed.');
    } finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) { setPwErr('Passwords do not match.'); return; }
    setSavingPw(true); setPwMsg(''); setPwErr('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'PUT', headers: authHeaders(), credentials: 'include',
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.detail;
        throw new Error(Array.isArray(detail) ? detail.map((e: { msg: string }) => e.msg).join(' ') : detail || 'Failed.');
      }
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      setPwMsg('Password changed successfully.');
    } catch (err: unknown) {
      setPwErr(err instanceof Error ? err.message : 'Failed to change password.');
    } finally { setSavingPw(false); }
  };

  const handleDelete = async () => {
    if (confirmDelete !== user?.email) { setDelErr('Email does not match. Please type your email to confirm.'); return; }
    setDeleting(true); setDelErr('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/account`, {
        method: 'DELETE', headers: authHeaders(), credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete account.');
      await logout();
      onNavigate('login');
    } catch (err: unknown) {
      setDelErr(err instanceof Error ? err.message : 'Deletion failed.');
      setDeleting(false);
    }
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Never';
  const roleColor: Record<string, string> = { student: '#10b981', faculty: '#6366f1', admin: '#f59e0b', super_admin: '#ef4444' };

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header card">
        <div className="profile-avatar">{user?.full_name?.charAt(0).toUpperCase()}</div>
        <div className="profile-meta">
          <h2>{user?.full_name}</h2>
          <p>{user?.email}</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: roleColor[user?.role || 'student'], border: `1px solid ${roleColor[user?.role || 'student']}33` }}>
              {user?.role}
            </span>
            <span className={`badge ${user?.email_verified ? 'badge-placed' : 'badge-unplaced'}`}>
              {user?.email_verified ? '✓ Verified' : '⚠ Unverified'}
            </span>
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-box">
            <div className="stat-label">Member since</div>
            <div className="stat-value" style={{ fontSize: '1rem' }}>{formatDate(user?.created_at || null)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Last login</div>
            <div className="stat-value" style={{ fontSize: '1rem' }}>{formatDate(user?.last_login_at || null)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {(['info', 'security', 'danger'] as const).map(tab => (
          <button key={tab} className={`profile-tab-btn ${activeTab === tab ? 'active' : ''} ${tab === 'danger' ? 'danger-tab' : ''}`}
            onClick={() => setActiveTab(tab)}>
            {tab === 'info' ? '👤 Profile' : tab === 'security' ? '🔒 Security' : '⚠️ Danger Zone'}
          </button>
        ))}
      </div>

      {/* Tab: Profile Info */}
      {activeTab === 'info' && (
        <div className="card">
          <div className="card-title">Edit Profile</div>
          <div className="card-subtitle">Update your personal information</div>
          {profileMsg && <div className="auth-alert auth-alert-success">✅ {profileMsg}</div>}
          {profileErr && <div className="auth-alert auth-alert-error">⚠️ {profileErr}</div>}
          <form onSubmit={handleProfileSave}>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={editForm.full_name}
                  onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Email cannot be changed here.</span>
              </div>
              <div className="form-group">
                <label className="form-label">College / Institution</label>
                <input className="form-input" value={editForm.college}
                  onChange={e => setEditForm(f => ({ ...f, college: e.target.value }))} placeholder="Your college name" />
              </div>
              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <input className="form-input" value={editForm.department}
                  onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Computer Science" />
              </div>
              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <select className="form-select" value={editForm.graduation_year}
                  onChange={e => setEditForm(f => ({ ...f, graduation_year: e.target.value }))}>
                  <option value="">Select year</option>
                  {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? <><span className="btn-spinner" /> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div className="card">
          <div className="card-title">Change Password</div>
          <div className="card-subtitle">Use a strong password to keep your account secure</div>
          {pwMsg && <div className="auth-alert auth-alert-success">✅ {pwMsg}</div>}
          {pwErr && <div className="auth-alert auth-alert-error">⚠️ {pwErr}</div>}
          <form onSubmit={handlePasswordChange}>
            {(['current_password', 'new_password', 'confirm_password'] as const).map(field => (
              <div className="form-group" key={field}>
                <label className="form-label">
                  {field === 'current_password' ? 'Current Password' : field === 'new_password' ? 'New Password' : 'Confirm New Password'}
                </label>
                <div className="input-with-icon">
                  <input
                    type={showPw[field.split('_')[0] as 'current' | 'new' | 'confirm'] ? 'text' : 'password'}
                    className="form-input"
                    value={pwForm[field]}
                    onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                    autoComplete={field === 'current_password' ? 'current-password' : 'new-password'}
                    disabled={savingPw}
                  />
                  <button type="button" className="toggle-password"
                    onClick={() => setShowPw(s => ({ ...s, [field.split('_')[0]]: !s[field.split('_')[0] as 'current' | 'new' | 'confirm'] }))}>
                    {showPw[field.split('_')[0] as 'current' | 'new' | 'confirm'] ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={savingPw}>
              {savingPw ? <><span className="btn-spinner" /> Changing...</> : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Danger Zone */}
      {activeTab === 'danger' && (
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.4)' }}>
          <div className="card-title" style={{ color: 'var(--accent-rose)' }}>⚠️ Delete Account</div>
          <div className="card-subtitle">This action is permanent and cannot be undone. All your data will be deleted.</div>
          {delErr && <div className="auth-alert auth-alert-error">⚠️ {delErr}</div>}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Type your email <strong>{user?.email}</strong> to confirm deletion</label>
            <input className="form-input" style={{ borderColor: 'rgba(239,68,68,0.4)' }}
              placeholder={user?.email} value={confirmDelete}
              onChange={e => { setConfirmDelete(e.target.value); setDelErr(''); }}
              disabled={deleting} />
          </div>
          <button
            className="btn"
            style={{ background: 'var(--accent-rose)', color: '#fff' }}
            onClick={handleDelete}
            disabled={deleting || confirmDelete !== user?.email}
          >
            {deleting ? <><span className="btn-spinner" /> Deleting...</> : 'Permanently Delete Account'}
          </button>
        </div>
      )}
    </div>
  );
}
