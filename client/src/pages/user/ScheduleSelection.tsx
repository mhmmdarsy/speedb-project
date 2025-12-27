import { useState } from 'react';
import type { Route, Schedule } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Clock, Users, ChevronLeft } from 'lucide-react';

interface ScheduleSelectionProps {
  route: Route;
  schedules: Schedule[];
  onSelectSchedule: (schedule: Schedule, passengers: number) => void;
  onBack: () => void;
}

export function ScheduleSelection({
  route,
  schedules,
  onSelectSchedule,
  onBack,
}: ScheduleSelectionProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [passengers, setPassengers] = useState(1);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const availableDates = new Set(
    schedules.filter((s) => s.routeId === route.id).map((s) => s.date),
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
    ];
    const months = [
      'Januari',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Desember',
    ];

    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  const filteredSchedules = selectedDate
    ? schedules.filter((s) => s.date === selectedDate && s.routeId === route.id)
    : [];

  const handleContinue = () => {
    if (selectedSchedule) {
      onSelectSchedule(selectedSchedule, passengers);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          type="button"
          aria-label="Kembali"
        >
          <ChevronLeft className="w-8 h-8 text-gray-600" />
        </button>
        <div>
          <h2>Tanggal & Jumlah Penumpang</h2>
        </div>
      </div>

      {/* Date Selection */}
      <div>
        <Card className="mb-3 shadow-none border-2 border-gray-200">
          <p className="">
            Tujuan: {route.origin} → {route.destination}
          </p>
        </Card>
        <label className="block mb-3 text-gray-900">
          Pilih Tanggal Keberangkatan
        </label>
        <div className="grid grid-cols-3 gap-3">
          {dates.map((date) => {
            const formatted = formatDate(date);
            const isSelected = selectedDate === date;
            const isAvailable = availableDates.has(date);

            return (
              <button
                key={date}
                type="button"
                disabled={!isAvailable}
                onClick={() => {
                  if (!isAvailable) return;
                  setSelectedDate(date);
                  setSelectedSchedule(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    isSelected
                      ? 'border-primary bg-primary/10 scale-105'
                      : isAvailable
                      ? 'border-gray-200 bg-white hover:border-primary/50'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <div className="text-center">
                  <p
                    className={`text-sm ${
                      isSelected ? 'text-primary' : 'text-gray-600'
                    }`}
                  >
                    {formatted.day}
                  </p>
                  <p className={isSelected ? 'text-primary' : 'text-gray-900'}>
                    {formatted.date}
                  </p>
                  <p
                    className={`text-sm ${
                      isSelected ? 'text-primary' : 'text-gray-600'
                    }`}
                  >
                    {formatted.month}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Selection */}
      {selectedDate && (
        <div>
          <label className="block mb-3 text-gray-900">
            Pilih Jam Keberangkatan
          </label>
          {filteredSchedules.length === 0 ? (
            <Card>
              <p className="text-center text-gray-600">
                Tidak ada jadwal tersedia untuk tanggal ini
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSchedules.map((schedule) => {
                const isSelected = selectedSchedule?.id === schedule.id;
                const isAvailable = schedule.availableSeats >= passengers;

                return (
                  <button
                    key={schedule.id}
                    onClick={() => isAvailable && setSelectedSchedule(schedule)}
                    disabled={!isAvailable}
                    className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-left
                      ${
                        isSelected
                          ? 'border-primary bg-primary/10 scale-[1.02]'
                          : ''
                      }
                      ${
                        !isSelected && isAvailable
                          ? 'border-gray-200 bg-white hover:border-primary/50'
                          : ''
                      }
                      ${
                        !isAvailable
                          ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                          : ''
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock
                          className={`w-6 h-6 ${
                            isSelected ? 'text-primary' : 'text-gray-600'
                          }`}
                        />
                        <span
                          className={
                            isSelected ? 'text-primary' : 'text-gray-900'
                          }
                        >
                          {schedule.departureTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-5 h-5" />
                        <span>{schedule.availableSeats} kursi</span>
                      </div>
                    </div>
                    {!isAvailable && (
                      <p className="mt-2 text-sm text-error">
                        Kursi tidak cukup untuk {passengers} penumpang
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Passenger Selection */}
      {selectedDate && (
        <div>
          <label className="block mb-3 text-gray-900">Jumlah Penumpang</label>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="medium"
              onClick={() => setPassengers(Math.max(1, passengers - 1))}
              className="w-16"
            >
              -
            </Button>
            <div className="flex-1 text-center">
              <p className="text-gray-900">{passengers} Orang</p>
            </div>
            <Button
              variant="outline"
              size="medium"
              onClick={() => setPassengers(passengers + 1)}
              className="w-16"
            >
              +
            </Button>
          </div>
        </div>
      )}

      {/* Total Price */}
      {selectedSchedule && (
        <Card className="bg-primary/5 border-2 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Total Harga</p>
              <p className="text-primary">
                Rp {(route.price * passengers).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="text-right text-gray-600">
              <p>{passengers} penumpang</p>
            </div>
          </div>
        </Card>
      )}

      {/* Continue Button */}
      <Button
        fullWidth
        onClick={handleContinue}
        disabled={!selectedSchedule || !selectedDate}
      >
        Lanjut ke Data Penumpang
      </Button>
    </div>
  );
}
