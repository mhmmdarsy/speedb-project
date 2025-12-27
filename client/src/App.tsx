import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase, projectId, publicAnonKey } from './lib/supabase';

import type {
  Route as BoatRoute,
  Schedule,
  Booking,
  BookingFormData,
} from './types';

import { ProgressSteps } from './components/ProgressSteps';
import { RouteSelection } from './pages/user/RouteSelection';
import { ScheduleSelection } from './pages/user/ScheduleSelection';
import { PassengerForm } from './pages/user/PassengerForm';
import { BookingSuccess } from './pages/user/BookingSuccess';

import { Login } from './pages/admin/Login';
import { Register } from './pages/admin/Register';
import { Dashboard } from './pages/admin/Dashboard';

import { Settings } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

type BookingStep = 'route' | 'schedule' | 'passenger' | 'success';

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

  /* ================= DATA ================= */
  const [routes, setRoutes] = useState<BoatRoute[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  /* ================= USER FLOW ================= */
  const [bookingStep, setBookingStep] = useState<BookingStep>('route');
  const [selectedRoute, setSelectedRoute] = useState<BoatRoute | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [selectedPassengers, setSelectedPassengers] = useState(1);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    Promise.all([fetchRoutes(), fetchSchedules()]).finally(() =>
      setInitialLoading(false),
    );
  }, []);

  const fetchRoutes = async () => {
    const res = await fetch(`${API_BASE_URL}/routes`);
    const data = await res.json();

    const mappedRoutes = (data.routes || []).map(
      (r: BoatRoute & { is_active?: boolean }) => ({
        ...r,
        isActive: r.is_active,
      }),
    );

    setRoutes(mappedRoutes);
  };

  const fetchSchedules = async () => {
    const res = await fetch(`${API_BASE_URL}/admin/schedules`);
    const data = await res.json();
    setSchedules(
      data.schedules.map(
        (s: {
          id: number;
          route_id: number;
          departure_date: string;
          departure_time: string;
          total_seats: number;
          available_seats: number;
        }) => ({
          id: s.id,
          routeId: s.route_id,
          date: s.departure_date,
          departureTime: s.departure_time,
          totalSeats: s.total_seats,
          availableSeats: s.available_seats,
        }),
      ),
    );
  };

  const fetchBookings = async () => {
    const res = await fetch(`${API_BASE_URL}/admin/bookings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    setBookings(data.bookings || []);
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
    navigate('/admin/dashboard', { replace: true });
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminLoggedIn(false);
    setAccessToken('');
    navigate('/', { replace: true });
  };

  const handleAdminRegister = async (
    email: string,
    password: string,
    name: string,
  ) => {
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-4075ff54/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      },
    );
    if (!res.ok) throw new Error('Registrasi gagal');
  };

  /* ================= USER BOOKING ================= */
  const handleSelectRoute = (route: BoatRoute) => {
    setSelectedRoute(route);
    setBookingStep('schedule');
  };

  const handleSelectSchedule = (schedule: Schedule, passengers: number) => {
    setSelectedSchedule(schedule);
    setSelectedPassengers(passengers);
    setBookingStep('passenger');
  };

  const handleSubmitPassenger = async (formData: BookingFormData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: selectedRoute!.id,
          scheduleId: selectedSchedule!.id,
          passengerName: formData.passengerName,
          passengerPhone: formData.passengerPhone,
          passengers: selectedPassengers,
          totalPrice: selectedRoute!.price * selectedPassengers,
        }),
      });

      const data = await res.json();
      setCurrentBooking(data.booking);
      setBookingStep('success');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Pilih Rute', 'Pilih Jadwal', 'Data Penumpang', 'Pembayaran'];
  const stepIndex = { route: 0, schedule: 1, passenger: 2, success: 3 }[
    bookingStep
  ];

  /* ================= ROUTES ================= */
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat data...
      </div>
    );
  }

  return (
    <Routes>
      {/* USER */}
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b px-4 py-4 flex justify-between">
              <h2>Speedboat Booking</h2>
              <button
                onClick={() => navigate('/admin/login')}
                aria-label="Admin Login"
                title="Admin Login"
              >
                <Settings />
              </button>
            </header>

            {bookingStep !== 'success' && (
              <ProgressSteps steps={steps} currentStep={stepIndex} />
            )}

            <div className="max-w-2xl mx-auto p-4">
              {loading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-800">Memproses pemesanan...</p>
                  </div>
                </div>
              )}

              {bookingStep === 'route' && (
                <RouteSelection
                  routes={routes}
                  onSelectRoute={handleSelectRoute}
                />
              )}

              {bookingStep === 'schedule' && selectedRoute && (
                <ScheduleSelection
                  route={selectedRoute}
                  schedules={schedules}
                  onSelectSchedule={handleSelectSchedule}
                  onBack={() => setBookingStep('route')}
                />
              )}

              {bookingStep === 'passenger' &&
                selectedRoute &&
                selectedSchedule && (
                  <PassengerForm
                    route={selectedRoute}
                    schedule={selectedSchedule}
                    passengers={selectedPassengers}
                    onSubmit={handleSubmitPassenger}
                    onBack={() => setBookingStep('schedule')}
                  />
                )}

              {bookingStep === 'success' && currentBooking && (
                <BookingSuccess
                  booking={currentBooking}
                  onNewBooking={() => window.location.reload()}
                />
              )}
            </div>
          </div>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin/login"
        element={<Login onLogin={handleAdminLogin} />}
      />

      <Route
        path="/admin/register"
        element={
          <Register
            onRegister={handleAdminRegister}
            onBackToLogin={() => navigate('/admin/login')}
          />
        }
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
              onRefresh={fetchBookings}
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
