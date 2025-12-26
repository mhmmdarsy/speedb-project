import { useState, useEffect } from 'react';
import type { Booking, Route, Schedule } from '../../types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import {
  LayoutDashboard,
  Ship,
  Calendar,
  Ticket,
  LogOut,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react';
import { BookingsManagement } from './bookings/BookingsManagement';
import { RoutesManagement } from './routes/RoutesManagement';
import { SchedulesManagement } from './schedules/SchedulesManagement';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../lib/supabase';

interface DashboardProps {
  bookings: Booking[];
  routes: Route[];
  schedules: Schedule[];
  accessToken: string;
  onLogout: () => void;
  onRefresh: () => void;
}

type Tab = 'overview' | 'bookings' | 'routes' | 'schedules';

export function Dashboard({
  bookings,
  routes,
  schedules,
  accessToken,
  onLogout,
  onRefresh,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [freshAccessToken, setFreshAccessToken] = useState<string>(accessToken);

  useEffect(() => {
    if (activeTab === 'routes') {
      getFreshToken()
        .then(setFreshAccessToken)
        .catch(() => setFreshAccessToken(''));
    }
  }, [activeTab]);

  // Get fresh token helper
  const getFreshToken = async (): Promise<string> => {
    const supabase = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
    );

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      alert('Session expired. Please login again.');
      onLogout();
      throw new Error('Session expired');
    }

    return data.session.access_token;
  };

  // Calculate statistics
  const totalRevenue = bookings
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const totalPassengers = bookings
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + b.passengers, 0);

  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  const tabs = [
    { id: 'overview' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings' as Tab, label: 'Pemesanan', icon: Ticket },
    { id: 'routes' as Tab, label: 'Rute', icon: Ship },
    { id: 'schedules' as Tab, label: 'Jadwal', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h2>Admin Dashboard</h2>
            <Button size="medium" variant="outline" onClick={onLogout}>
              <LogOut className="w-5 h-5 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-4 transition-colors whitespace-nowrap
                    ${
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3>Ringkasan</h3>
              <Button size="medium" onClick={onRefresh}>
                Refresh Data
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Pendapatan</p>
                    <p className="text-gray-900">
                      Rp {totalRevenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Penumpang</p>
                    <p className="text-gray-900">{totalPassengers} orang</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-gray-900">{pendingBookings} pemesanan</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <h3 className="mb-4">Pemesanan Terbaru</h3>
              {bookings.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  Belum ada pemesanan
                </p>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-gray-50 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="text-gray-900">{booking.passengerName}</p>
                        <p className="text-sm text-gray-600">
                          {booking.origin} → {booking.destination}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900">
                          Rp {booking.totalPrice.toLocaleString('id-ID')}
                        </p>
                        <span
                          className={`text-sm px-3 py-1 rounded-full inline-block
                            ${
                              booking.status === 'paid'
                                ? 'bg-success/10 text-success'
                                : ''
                            }
                            ${
                              booking.status === 'pending'
                                ? 'bg-warning/10 text-warning'
                                : ''
                            }
                            ${
                              booking.status === 'cancelled'
                                ? 'bg-error/10 text-error'
                                : ''
                            }
                          `}
                        >
                          {booking.status === 'paid' ? 'Lunas' : ''}
                          {booking.status === 'pending' ? 'Pending' : ''}
                          {booking.status === 'cancelled' ? 'Batal' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'bookings' && <BookingsManagement bookings={bookings} />}

        {activeTab === 'routes' && (
          <RoutesManagement
            routes={routes}
            accessToken={freshAccessToken}
            onRefresh={onRefresh}
          />
        )}

        {activeTab === 'schedules' && (
          <SchedulesManagement
            schedules={schedules}
            routes={routes}
            accessToken={accessToken}
            onRefresh={onRefresh}
          />
        )}
      </div>
    </div>
  );
}
