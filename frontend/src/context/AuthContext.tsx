/**
 * frontend/src/context/AuthContext.tsx
 * Centralized authentication state for the entire application.
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { API_BASE } from '../config';

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  college: string | null;
  department: string | null;
  graduation_year: number | null;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<string>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  college?: string;
  department?: string;
  graduation_year?: number;
  role?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    loading: true,
    error: null,
  });

  const setError = (error: string | null) =>
    setState(s => ({ ...s, error }));

  /** Fetch /me using stored access token to rehydrate session on page load */
  const fetchCurrentUser = useCallback(async (token?: string): Promise<AuthUser | null> => {
    const storedToken = token || localStorage.getItem('access_token');
    if (!storedToken) return null;
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
        credentials: 'include',
      });
      if (!res.ok) {
        localStorage.removeItem('access_token');
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  /** On mount — check if there's a valid session */
  useEffect(() => {
    (async () => {
      const storedToken = localStorage.getItem('access_token');
      if (!storedToken) {
        setState(s => ({ ...s, loading: false }));
        return;
      }
      const user = await fetchCurrentUser(storedToken);
      if (user) {
        setState({ isAuthenticated: true, user, accessToken: storedToken, loading: false, error: null });
      } else {
        // Try refresh via cookie
        try {
          const res = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('access_token', data.access_token);
            const freshUser = await fetchCurrentUser(data.access_token);
            if (freshUser) {
              setState({ isAuthenticated: true, user: freshUser, accessToken: data.access_token, loading: false, error: null });
              return;
            }
          }
        } catch { /* ignore */ }
        localStorage.removeItem('access_token');
        setState(s => ({ ...s, loading: false, isAuthenticated: false, user: null, accessToken: null }));
      }
    })();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string, rememberMe = false) => {
    setState(s => ({ ...s, loading: true, error: null }));
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    });
    const data = await res.json();
    if (!res.ok) {
      setState(s => ({ ...s, loading: false, error: data.detail || 'Login failed.' }));
      throw new Error(data.detail || 'Login failed.');
    }
    localStorage.setItem('access_token', data.access_token);
    const user = await fetchCurrentUser(data.access_token);
    setState({ isAuthenticated: true, user, accessToken: data.access_token, loading: false, error: null });
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
    } catch { /* ignore network errors on logout */ }
    localStorage.removeItem('access_token');
    setState({ isAuthenticated: false, user: null, accessToken: null, loading: false, error: null });
  };

  const register = async (data: RegisterData): Promise<string> => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) {
      const detail = body.detail;
      if (Array.isArray(detail)) {
        throw new Error(detail.map((e: { msg: string }) => e.msg).join(' '));
      }
      throw new Error(detail || 'Registration failed.');
    }
    return body.message;
  };

  const refreshUser = async () => {
    const user = await fetchCurrentUser();
    if (user) setState(s => ({ ...s, user }));
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register, refreshUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
