import { ClerkProvider, SignIn, SignUp, useUser, useAuth } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import AnalysisResult from './pages/AnalysisResult';
import RoleSelection from './pages/RoleSelection';
import TestPage from './pages/TestPage';
import TestResult from './pages/TestResult';
import RankingPage from './pages/RankingPage';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import { UserProvider, useMongoUser } from './context/UserContext';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// ── Protected Route (Auth Check) ─────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="loading-overlay" style={{ height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children;
}

// ── Admin Route (Role Check) ────────────────────────────────────────────────
function AdminRoute({ children }) {
  const { loading, isAdmin } = useMongoUser();

  if (loading) {
    return (
      <div className="loading-overlay" style={{ height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ── Root Redirect (Landing vs Dashboard) ────────────────────────────────────
function RootRedirect() {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) {
    return (
      <div className="loading-overlay" style={{ height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }
  return isSignedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

// ── App Layout ──────────────────────────────────────────────────────────────
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY.includes('your_clerk')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px', fontFamily: 'Inter, sans-serif', background: '#0a0a1a', color: '#f0f0ff' }}>
        <div style={{ fontSize: '3rem' }}>⚙️</div>
        <h2>Setup Required</h2>
        <p style={{ color: '#a0a0c0', textAlign: 'center', maxWidth: '400px' }}>
          Please add your <code style={{ color: '#6c63ff' }}>VITE_CLERK_PUBLISHABLE_KEY</code> to the <code style={{ color: '#00d4ff' }}>frontend/.env</code> file.
        </p>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} fallbackRedirectUrl="/dashboard">
      <BrowserRouter>
        <UserProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/sign-in/*" element={<div className="auth-page"><SignIn routing="path" path="/sign-in" /></div>} />
            <Route path="/sign-up/*" element={<div className="auth-page"><SignUp routing="path" path="/sign-up" /></div>} />

            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><AppLayout><UploadPage /></AppLayout></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute><AppLayout><AnalysisResult /></AppLayout></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute><AppLayout><RoleSelection /></AppLayout></ProtectedRoute>} />
            <Route path="/test/:roleId" element={<ProtectedRoute><AppLayout><TestPage /></AppLayout></ProtectedRoute>} />
            <Route path="/test-result" element={<ProtectedRoute><AppLayout><TestResult /></AppLayout></ProtectedRoute>} />
            <Route path="/ranking" element={<ProtectedRoute><AppLayout><RankingPage /></AppLayout></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AppLayout><AdminPanel /></AppLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </ClerkProvider>
  );
}
