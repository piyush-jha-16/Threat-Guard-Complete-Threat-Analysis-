import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { getMockCurrentUser } from './lib/mockAuth';
import AuthLayout from './components/AuthLayout';
import AuthCard from './components/AuthCard';
import Dashboard from './pages/Dashboard';
import DocumentScanning from './pages/DocumentScanning';
import Weblinks from './pages/Weblinks';
import Executables from './pages/Executables';
import Applications from './pages/Applications';
import NetworkScanning from './pages/NetworkScanning';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for mock auth session first
    const mockUser = getMockCurrentUser();
    const isMockAuthenticated = localStorage.getItem('tg_authenticated') === 'true';
    
    if (mockUser || isMockAuthenticated) {
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // Get initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    }).catch((err) => {
      console.warn('Supabase session check (using mock auth):', err.message);
      setLoading(false);
    });

    // Listen for Supabase auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#fafafa] dark:bg-[#121212] flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route: Only accessible if NOT logged in */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <AuthLayout>
                <AuthCard />
              </AuthLayout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Dashboard Route: Only accessible if logged in */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/document-scanning"
          element={
            isAuthenticated ? (
              <DocumentScanning />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/weblinks"
          element={
            isAuthenticated ? (
              <Weblinks />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/executables"
          element={
            isAuthenticated ? (
              <Executables />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/applications"
          element={
            isAuthenticated ? (
              <Applications />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/network-scanning"
          element={
            isAuthenticated ? (
              <NetworkScanning />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/reports"
          element={
            isAuthenticated ? (
              <Reports />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated ? (
              <Settings />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
