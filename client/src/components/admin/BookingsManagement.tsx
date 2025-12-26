import { useState } from 'react';
import type { Booking } from '../../../client/types';
import { Card } from '../../../client/components/common/Card';

interface BookingsManagementProps {
  bookings: Booking[];
}

export function BookingsManagement({ bookings }: BookingsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBookings = bookings.filter((booking: Booking) => {
    const matchesSearch =
      booking.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passengerPhone.includes(searchTerm) ||
      booking.id.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3>Kelola Pemesanan</h3>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            {/* Search icon removed due to missing lucide-react dependency */}
            <input
              type="text"
              placeholder="Cari nama, HP, atau kode booking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
            aria-label="Filter status pemesanan"
          >
            <option value="all">Semua Status</option>
            <option value="paid">Lunas</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Batal</option>
          </select>
        </div>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">
            Tidak ada pemesanan ditemukan
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-gray-100">
                  <div>
                    <p className="text-sm text-gray-600">Kode Booking</p>
                    <p className="text-gray-900">{booking.id.split(':')[1]}</p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full
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

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {/* <User className="w-5 h-5 text-gray-400" /> */}
                      <div>
                        <p className="text-sm text-gray-600">Nama Penumpang</p>
                        <p className="text-gray-900">{booking.passengerName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* <Phone className="w-5 h-5 text-gray-400" /> */}
                      <div>
                        <p className="text-sm text-gray-600">No. HP</p>
                        <p className="text-gray-900">
                          {booking.passengerPhone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {/* <Calendar className="w-5 h-5 text-gray-400" /> */}
                      <div>
                        <p className="text-sm text-gray-600">Tanggal & Jam</p>
                        <p className="text-gray-900">
                          {formatDate(booking.date)} - {booking.departureTime}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Rute</p>
                      <p className="text-gray-900">
                        {booking.origin} → {booking.destination}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                  <div>
                    <p className="text-sm text-gray-600">Total Pembayaran</p>
                    <p className="text-primary">
                      Rp {booking.totalPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Penumpang</p>
                    <p className="text-gray-900">{booking.passengers} orang</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
