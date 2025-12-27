import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

import { useRoutes } from './hooks/useRoutes';
import { useSchedules } from './hooks/useSchedules';
import { useBookings } from './hooks/useBookings';

import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { UserBookingLayout } from './pages/user/UserBookingLayout';

export default function App() {
  const navigate = useNavigate();

  /* ================= AUTH ================= */
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        setAccessToken(data.session.access_token);
        setIsAdminLoggedIn(true);
      }
    });
  }, []);

  /* ================= DATA (HOOKS) ================= */
  const { routes, fetchRoutes } = useRoutes();
  const { schedules, fetchSchedules } = useSchedules();
  const { bookings, fetchBookings } = useBookings(accessToken);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchRoutes();
    fetchSchedules();
  }, []);

  const refreshAdminData = async () => {
    await Promise.all([
      fetchRoutes(),
      fetchSchedules(),
      fetchBookings(),
    ]);
  };

  /* ================= ADMIN ACTIONS ================= */
  const handleAdminLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    setAccessToken(data.session!.access_token);
    setIsAdminLoggedIn(true);
    await fetchBookings();

    navigate('/admin/dashboard', { replace: true });
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminLoggedIn(false);
    setAccessToken('');
    navigate('/', { replace: true });
  };

  /* ================= ROUTING ================= */
  return (
    <Routes>
      {/* USER */}
      <Route
        path="/"
        element={
          <UserBookingLayout
            routes={routes}
            schedules={schedules}
          />
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin/login"
        element={<Login onLogin={handleAdminLogin} />}
      />

      <Route
        path="/admin/dashboard"
        element={
          isAdminLoggedIn ? (
            <Dashboard
              bookings={bookings}
              routes={routes}
              schedules={schedules}
              onLogout={handleAdminLogout}
              onRefresh={refreshAdminData}
              accessToken={accessToken}
            />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
    </Routes>
  );
}
