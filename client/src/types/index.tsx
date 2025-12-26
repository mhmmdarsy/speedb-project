export interface Route {
  id: string;
  origin: string;
  destination: string;
  price: number;
  duration: string;
  isActive: boolean;
}

export interface Schedule {
  id: string;
  routeId: string;
  departureTime: string;
  availableSeats: number;
  totalSeats: number;
  date: string;
}

export interface Booking {
  id: string;
  routeId: string;
  scheduleId: string;
  passengerName: string;
  passengerPhone: string;
  passengers: number;
  totalPrice: number;
  status: "pending" | "paid" | "cancelled";
  paymentToken?: string;
  createdAt: string;
  origin: string;
  destination: string;
  departureTime: string;
  date: string;
}

export interface BookingFormData {
  passengerName: string;
  passengerPhone: string;
  passengers: number;
}