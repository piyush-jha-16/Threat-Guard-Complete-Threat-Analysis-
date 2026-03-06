import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to get session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
            !session ? (
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
            session ? (
              <Dashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/document-scanning"
          element={
            session ? (
              <DocumentScanning />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/weblinks"
          element={
            session ? (
              <Weblinks />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/executables"
          element={
            session ? (
              <Executables />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/applications"
          element={
            session ? (
              <Applications />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/network-scanning"
          element={
            session ? (
              <NetworkScanning />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/reports"
          element={
            session ? (
              <Reports />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            session ? (
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
