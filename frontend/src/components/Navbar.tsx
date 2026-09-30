import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Target, Award, Compass, Map, History, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onNavigate }) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'predictor', label: 'Placement Predictor', icon: Target },
    { id: 'skills', label: 'Skill Analyzer', icon: Award },
    { id: 'roles', label: 'Job Roles', icon: Compass },
    { id: 'roadmap', label: 'Career Roadmap', icon: Map },
    { id: 'history', label: 'Prediction History', icon: History },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    onNavigate('login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Placement & Skill Intelligence</span>
      </div>
      <ul className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* User Menu */}
      {user && (
        <div className="nav-user-menu" ref={menuRef}>
          <button className="nav-user-btn" onClick={() => setUserMenuOpen(v => !v)}>
            <div className="nav-user-avatar">{user.full_name.charAt(0).toUpperCase()}</div>
            <span className="nav-user-name">{user.full_name.split(' ')[0]}</span>
            <ChevronDown size={14} />
          </button>
          {userMenuOpen && (
            <div className="nav-user-dropdown">
              <div className="dropdown-user-info">
                <div className="dropdown-avatar">{user.full_name.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.full_name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-indigo)', marginTop: '2px', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => { setUserMenuOpen(false); onNavigate('profile'); }}>
                <User size={14} /> My Profile
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
