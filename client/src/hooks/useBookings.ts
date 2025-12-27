import { useState } from 'react';
import type { Booking } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

export function useBookings(accessToken: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    if (!accessToken) return;

    const res = await fetch(`${API_BASE_URL}/admin/bookings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await res.json();
    setBookings(data.bookings || []);
  };

  return { bookings, fetchBookings };
}
