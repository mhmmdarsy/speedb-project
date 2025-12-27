import { useState, useEffect } from 'react';
import { supabase, projectId, publicAnonKey } from './lib/supabase';
import type { Route, Schedule, Booking, BookingFormData } from './types';
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

declare global {
  interface Window {
    snap:
      | {
          pay: (token: string, options?: Record<string, unknown>) => void;
        }
      | undefined;
  }
}

type BookingStep = 'route' | 'schedule' | 'passenger' | 'payment' | 'success';
type AppMode = 'user' | 'admin' | 'register';

export default function App() {
  const [mode, setMode] = useState<AppMode>('user');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  // Data
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // User booking flow
  const [bookingStep, setBookingStep] = useState<BookingStep>('route');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [selectedPassengers, setSelectedPassengers] = useState(1);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load Midtrans Snap script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', 'SB-Mid-client-YOUR_CLIENT_KEY'); // User needs to replace this
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Check existing session
  useEffect(() => {
    checkSession();
  }, []);

  // Fetch data
  useEffect(() => {
    fetchRoutes();
    fetchSchedules();
    if (isAdminLoggedIn) {
      fetchBookings();
    }
  }, [isAdminLoggedIn]);

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        setAccessToken(data.session.access_token);
        setIsAdminLoggedIn(true);
        setMode('admin');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  // Function to get fresh access token
  const getFreshAccessToken = async (): Promise<string> => {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      console.error('Session expired or invalid:', error);
      // Session expired, force logout
      handleAdminLogout();
      throw new Error('Session expired. Please login again.');
    }

    // Update token in state
    const token = data.session.access_token;
    setAccessToken(token);
    return token;
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/routes`);
      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }

      const data = await response.json();

      const mappedRoutes = (data.routes || []).map((r: Route & { is_active?: boolean }) => ({
        ...r,
        isActive: r.is_active,
      }));

      setRoutes(mappedRoutes);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/schedules`);

      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }

      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = await getFreshAccessToken();

      const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        alert('Session expired atau tidak punya akses.');
        handleAdminLogout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleRefreshData = () => {
    fetchRoutes();
    fetchSchedules();
    if (isAdminLoggedIn) {
      fetchBookings();
    }
  };

  const handleAdminLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // const token = data.session.access_token;

    if (error) {
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      setAccessToken(data.session.access_token);
      setIsAdminLoggedIn(true);
      setMode('admin');
    }
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminLoggedIn(false);
    setAccessToken('');
    setMode('user');
  };

  const handleAdminRegister = async (
    email: string,
    password: string,
    name: string,
  ) => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-4075ff54/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registrasi gagal');
    }

    return response.json();
  };

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    setBookingStep('schedule');
  };

  const handleSelectSchedule = (schedule: Schedule, passengers: number) => {
    setSelectedSchedule(schedule);
    setSelectedPassengers(passengers);
    setBookingStep('passenger');
  };

  const handleSubmitPassenger = async (formData: BookingFormData) => {
    if (!selectedRoute || !selectedSchedule) return;

    setLoading(true);

    try {
      // Create booking
      const bookingResponse = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routeId: selectedRoute.id,
          scheduleId: selectedSchedule.id,
          passengerName: formData.passengerName,
          passengerPhone: formData.passengerPhone,
          passengers: selectedPassengers,
          totalPrice: selectedRoute.price * selectedPassengers,
          origin: selectedRoute.origin,
          destination: selectedRoute.destination,
          departureTime: selectedSchedule.departureTime,
          date: selectedSchedule.date,
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      const bookingData = await bookingResponse.json();

      // Create payment
      const paymentResponse = await fetch(`${API_BASE_URL}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingData.booking.id,
          amount: selectedRoute.price * selectedPassengers,
          customerDetails: {
            first_name: formData.passengerName,
            phone: formData.passengerPhone,
          },
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment');
      }

      const paymentData = await paymentResponse.json();

      // Open Midtrans Snap
      if (window.snap) {
        window.snap.pay(paymentData.token, {
          onSuccess: async () => {
            // Update booking status
            await fetch(
              `${API_BASE_URL}/bookings/${bookingData.booking.id}/status`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'paid' }),
              },
            );

            // Fetch the updated booking
            const bookingDetailResponse = await fetch(
              `${API_BASE_URL}/bookings/${bookingData.booking.id}`,
            );

            if (bookingDetailResponse.ok) {
              const bookingDetail = await bookingDetailResponse.json();
              setCurrentBooking(bookingDetail.booking);
              setBookingStep('success');
            }
          },
          onPending: () => {
            alert('Menunggu pembayaran Anda. Silakan selesaikan pembayaran.');
          },
          onError: () => {
            alert('Pembayaran gagal. Silakan coba lagi.');
          },
          onClose: () => {
            alert(
              'Anda menutup popup pembayaran. Silakan lanjutkan pembayaran untuk menyelesaikan pesanan.',
            );
          },
        });
      } else {
        alert('Payment gateway belum siap. Silakan refresh halaman.');
      }
    } catch (error) {
      console.error('Error processing booking:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewBooking = () => {
    setBookingStep('route');
    setSelectedRoute(null);
    setSelectedSchedule(null);
    setSelectedPassengers(1);
    setCurrentBooking(null);
  };

  const steps = ['Pilih Rute', 'Pilih Jadwal', 'Data Penumpang', 'Pembayaran'];
  const currentStepIndex = {
    route: 0,
    schedule: 1,
    passenger: 2,
    payment: 3,
    success: 4,
  }[bookingStep];

  // Admin mode
  if (mode === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <Login
          onLogin={handleAdminLogin}
          onRegisterClick={() => setMode('register')}
        />
      );
    }

    return (
      <Dashboard
        bookings={bookings}
        routes={routes}
        schedules={schedules}
        onLogout={handleAdminLogout}
        onRefresh={handleRefreshData}
        accessToken={accessToken}
      />
    );
  }

  // Register mode
  if (mode === 'register') {
    return (
      <Register
        onRegister={handleAdminRegister}
        onBackToLogin={() => setMode('admin')}
      />
    );
  }

  // User mode - Show loading state while fetching initial data
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // User mode
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h2>Speedboat Booking</h2>
          <button
            onClick={() => setMode('admin')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Admin Login"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      {bookingStep !== 'success' && (
        <ProgressSteps steps={steps} currentStep={currentStepIndex} />
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {bookingStep === 'route' && (
          <RouteSelection routes={routes} onSelectRoute={handleSelectRoute} />
        )}

        {bookingStep === 'schedule' && selectedRoute && (
          <ScheduleSelection
            route={selectedRoute}
            schedules={schedules}
            onSelectSchedule={handleSelectSchedule}
            onBack={() => setBookingStep('route')}
          />
        )}

        {bookingStep === 'passenger' && selectedRoute && selectedSchedule && (
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
            onNewBooking={handleNewBooking}
          />
        )}

        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-900">Memproses pemesanan...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
