/**
 * frontend/src/components/ProtectedRoute.tsx
 * Wraps any component — redirects to /login if not authenticated.
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate: (path: string) => void;
  currentPath: string;
}

export function ProtectedRoute({ children, onNavigate, currentPath }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner" />
        <p>Loading your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save intended destination so we can redirect back after login
    sessionStorage.setItem('redirectAfterLogin', currentPath);
    onNavigate('login');
    return null;
  }

  return <>{children}</>;
}
