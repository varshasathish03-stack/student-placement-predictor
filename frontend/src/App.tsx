import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { PlacementPredictor } from './pages/PlacementPredictor';
import { SkillAnalyzer } from './pages/SkillAnalyzer';
import { JobRoleExplorer } from './pages/JobRoleExplorer';
import { CareerRoadmap } from './pages/CareerRoadmap';
import { PredictionHistory } from './pages/PredictionHistory';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { Profile } from './pages/auth/Profile';

// Public routes that don't need authentication
const PUBLIC_ROUTES = new Set(['login', 'register', 'forgot-password', 'reset-password', 'verify-email']);

function AppInner() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedSkillsForRoadmap, setSelectedSkillsForRoadmap] = useState<string[]>(['Python', 'SQL', 'Git']);
  const [selectedRoleForRoadmap, setSelectedRoleForRoadmap] = useState<string>('data-analyst');

  // Helper to extract path name without leading slash or query params
  const getCleanPath = () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      return hash.split('?')[0];
    }
    const pathname = window.location.pathname.replace(/^\/+/, '');
    return pathname.split('?')[0] || 'dashboard';
  };

  const [currentPath, setCurrentPath] = useState<string>(() => getCleanPath());

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.location.hash = path;
  };

  // Sync hash and popstate changes (browser back/forward)
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(getCleanPath());
    };
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Redirect to login if not authenticated and on a protected route
  useEffect(() => {
    if (!loading && !isAuthenticated && !PUBLIC_ROUTES.has(currentPath)) {
      navigate('login');
    }
    // Redirect to dashboard if authenticated and on public auth page
    if (!loading && isAuthenticated && PUBLIC_ROUTES.has(currentPath)) {
      navigate('dashboard');
    }
  }, [isAuthenticated, loading, currentPath]);

  // While checking session, show loading screen
  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner" />
        <p>Loading your session...</p>
      </div>
    );
  }

  // ── Public / Auth Routes ───────────────────────────────────────────────────
  if (currentPath === 'login') return <Login onNavigate={navigate} />;
  if (currentPath === 'register') return <Register onNavigate={navigate} />;
  if (currentPath === 'forgot-password') return <ForgotPassword onNavigate={navigate} />;
  if (currentPath === 'reset-password') return <ResetPassword onNavigate={navigate} />;
  if (currentPath === 'verify-email') return <VerifyEmail onNavigate={navigate} />;

  // ── Protected App Shell ────────────────────────────────────────────────────
  if (!isAuthenticated) return null; // will be redirected by effect

  const handleSetActiveTab = (tab: string) => {
    navigate(tab);
  };

  const resolvedTab = PUBLIC_ROUTES.has(currentPath) ? 'dashboard' : currentPath;

  return (
    <div className="app-container">
      <Navbar
        activeTab={resolvedTab}
        setActiveTab={handleSetActiveTab}
        onNavigate={navigate}
      />

      <main className="main-content">
        {resolvedTab === 'dashboard' && <Dashboard setActiveTab={handleSetActiveTab} />}
        {resolvedTab === 'predictor' && <PlacementPredictor />}
        {resolvedTab === 'skills' && (
          <SkillAnalyzer
            setActiveTab={handleSetActiveTab}
            setSelectedSkillsForRoadmap={setSelectedSkillsForRoadmap}
            setSelectedRoleForRoadmap={setSelectedRoleForRoadmap}
          />
        )}
        {resolvedTab === 'roles' && (
          <JobRoleExplorer
            setActiveTab={handleSetActiveTab}
            setSelectedRoleForRoadmap={setSelectedRoleForRoadmap}
          />
        )}
        {resolvedTab === 'roadmap' && (
          <CareerRoadmap
            selectedSkills={selectedSkillsForRoadmap}
            selectedRoleId={selectedRoleForRoadmap}
            setSelectedRoleId={setSelectedRoleForRoadmap}
          />
        )}
        {resolvedTab === 'history' && <PredictionHistory />}
        {resolvedTab === 'profile' && <Profile onNavigate={navigate} />}
      </main>

      <footer className="footer">
        <p>Student Placement & Skill Analyzer © 2026. Built with Scikit-Learn, FastAPI, & React.</p>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
