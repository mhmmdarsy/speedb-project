import { useState } from 'react';
import type { Schedule } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const fetchSchedules = async () => {
    const res = await fetch(`${API_BASE_URL}/admin/schedules`);
    const data = await res.json();

    setSchedules(
      data.schedules.map((s: Schedule & { route_id?: number; departure_date?: string; departure_time?: string; total_seats?: number; available_seats?: number }) => ({
        id: s.id,
        routeId: s.route_id,
        date: s.departure_date,
        departureTime: s.departure_time,
        totalSeats: s.total_seats,
        availableSeats: s.available_seats,
      })),
    );
  };

  return { schedules, fetchSchedules };
}
