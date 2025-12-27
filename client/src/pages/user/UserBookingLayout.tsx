import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Route, Schedule, Booking, BookingFormData } from '../../types';

import { ProgressSteps } from '../../components/ProgressSteps';
import { RouteSelection } from './RouteSelection';
import { ScheduleSelection } from './ScheduleSelection';
import { PassengerForm } from './PassengerForm';
import { BookingSuccess } from './BookingSuccess';

import { Settings } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

type BookingStep = 'route' | 'schedule' | 'passenger' | 'success';

interface UserBookingLayoutProps {
  routes: Route[];
  schedules: Schedule[];
}

export function UserBookingLayout({
  routes,
  schedules,
}: UserBookingLayoutProps) {
  const navigate = useNavigate();

  const [bookingStep, setBookingStep] = useState<BookingStep>('route');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [selectedPassengers, setSelectedPassengers] = useState(1);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);

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
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: selectedRoute.id,
          scheduleId: selectedSchedule.id,
          passengerName: formData.passengerName,
          passengerPhone: formData.passengerPhone,
          passengers: selectedPassengers,
          totalPrice: selectedRoute.price * selectedPassengers,
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
  const currentStepIndex = {
    route: 0,
    schedule: 1,
    passenger: 2,
    success: 3,
  }[bookingStep];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-4 flex place-content-end">
        <button
          onClick={() => navigate('/admin/login')}
          title="Admin Login"
          aria-label="Admin Login"
        >
          <Settings />
        </button>
      </header>

      {bookingStep !== 'success' && (
        <ProgressSteps steps={steps} currentStep={currentStepIndex} />
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
            onNewBooking={() => window.location.reload()}
          />
        )}
      </div>
    </div>
  );
}
