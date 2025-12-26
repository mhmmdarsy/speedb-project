import { useState } from 'react';
import { Route, Schedule, BookingFormData } from '../../types';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { ChevronLeft, User, Phone } from 'lucide-react';

interface PassengerFormProps {
  route: Route;
  schedule: Schedule;
  passengers: number;
  onSubmit: (data: BookingFormData) => void;
  onBack: () => void;
}

export function PassengerForm({
  route,
  schedule,
  passengers,
  onSubmit,
  onBack,
}: PassengerFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    passengerName: '',
    passengerPhone: '',
    passengers,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.passengerName.trim()) {
      newErrors.passengerName = 'Nama harus diisi';
    }

    if (!formData.passengerPhone.trim()) {
      newErrors.passengerPhone = 'No. HP harus diisi';
    } else if (
      !/^[0-9]{10,13}$/.test(formData.passengerPhone.replace(/\D/g, ''))
    ) {
      newErrors.passengerPhone = 'No. HP tidak valid (10-13 digit)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const totalPrice = route.price * passengers;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-8 h-8 text-gray-600" />
        </button>
        <div>
          <h2>Data Penumpang</h2>
          <p className="text-gray-600">Isi data untuk pemesanan</p>
        </div>
      </div>

      {/* Booking Summary */}
      <Card className="bg-gray-50">
        <h3 className="mb-4">Ringkasan Pemesanan</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Rute:</span>
            <span className="text-gray-900">
              {route.origin} → {route.destination}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tanggal:</span>
            <span className="text-gray-900">
              {new Date(schedule.date).toLocaleDateString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Jam:</span>
            <span className="text-gray-900">{schedule.departureTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Penumpang:</span>
            <span className="text-gray-900">{passengers} orang</span>
          </div>
          <div className="flex justify-between pt-3 border-t-2 border-gray-200">
            <span className="text-gray-900">Total:</span>
            <span className="text-primary">
              Rp {totalPrice.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </Card>

      {/* Passenger Information */}
      <Card>
        <h3 className="mb-4">Informasi Penumpang</h3>
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-[52px] w-5 h-5 text-gray-400" />
            <Input
              label="Nama Lengkap"
              type="text"
              value={formData.passengerName}
              onChange={(e) =>
                setFormData({ ...formData, passengerName: e.target.value })
              }
              error={errors.passengerName}
              placeholder="Masukkan nama lengkap"
              className="pl-12"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-[52px] w-5 h-5 text-gray-400" />
            <Input
              label="No. Handphone / WhatsApp"
              type="tel"
              value={formData.passengerPhone}
              onChange={(e) =>
                setFormData({ ...formData, passengerPhone: e.target.value })
              }
              error={errors.passengerPhone}
              placeholder="08xxxxxxxxxx"
              className="pl-12"
            />
          </div>
        </div>
      </Card>

      {/* Important Notice */}
      <Card className="bg-warning/10 border-2 border-warning">
        <p className="text-gray-900">
          <strong>Penting:</strong> Pastikan data yang Anda masukkan sudah
          benar. Tiket akan dikirim via WhatsApp setelah pembayaran berhasil.
        </p>
      </Card>

      {/* Submit Button */}
      <Button type="submit" fullWidth>
        Lanjut ke Pembayaran
      </Button>
    </form>
  );
}
