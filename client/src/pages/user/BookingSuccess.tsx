import type { Booking } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { CheckCircle, MapPin, Calendar, Clock, Users, Ticket } from 'lucide-react';

interface BookingSuccessProps {
  booking: Booking;
  onNewBooking: () => void;
}

export function BookingSuccess({ booking, onNewBooking }: BookingSuccessProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="space-y-6 pb-8">
      <div className="text-center py-8">
        <CheckCircle className="w-24 h-24 mx-auto mb-4 text-success" />
        <h1 className="mb-2 text-success">Pembayaran Berhasil!</h1>
        <p className="text-gray-600">Tiket Anda telah berhasil dipesan</p>
      </div>
      
      {/* Ticket Card */}
      <Card className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-white/20">
          <Ticket className="w-8 h-8" />
          <div>
            <p className="text-white/80 text-sm">Kode Booking</p>
            <p className="text-xl">{booking.id.split(':')[1]}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white/80 text-sm">Rute</p>
              <p>{booking.origin} → {booking.destination}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white/80 text-sm">Tanggal</p>
              <p>{formatDate(booking.date)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white/80 text-sm">Jam Keberangkatan</p>
              <p>{booking.departureTime}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white/80 text-sm">Jumlah Penumpang</p>
              <p>{booking.passengers} orang</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t-2 border-white/20">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Total Pembayaran</span>
            <span className="text-2xl">Rp {booking.totalPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </Card>
      
      {/* Passenger Details */}
      <Card>
        <h3 className="mb-4">Data Penumpang</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Nama:</span>
            <span className="text-gray-900">{booking.passengerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">No. HP:</span>
            <span className="text-gray-900">{booking.passengerPhone}</span>
          </div>
        </div>
      </Card>
      
      {/* Important Info */}
      <Card className="bg-primary/5 border-2 border-primary">
        <h3 className="mb-3">Informasi Penting</h3>
        <ul className="space-y-2 text-gray-900">
          <li>✓ Simpan kode booking Anda</li>
          <li>✓ Tunjukkan tiket ini saat check-in</li>
          <li>✓ Datang 30 menit sebelum keberangkatan</li>
          <li>✓ Bawa identitas diri yang sah</li>
        </ul>
      </Card>
      
      {/* Action Buttons */}
      <div className="space-y-3">
        <Button fullWidth onClick={onNewBooking}>
          Pesan Tiket Lagi
        </Button>
        
        <Button 
          fullWidth 
          variant="outline"
          onClick={() => window.print()}
        >
          Cetak Tiket
        </Button>
      </div>
    </div>
  );
}
