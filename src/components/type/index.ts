export interface Route {
    _id: string;
    name: string;
    code: string;
    originStation: Station[];
    destinationStation: Station[];
    distanceKm: number;
    estimatedDuration: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }
  
  
  export interface Seat {
    id: string;
    number: string;
    isAvailable: boolean;
    price: number;
    type: 'standard' | 'premium' | 'vip';
  }
  
  export interface BusLayout {
    rows: number;
    columns: number;
    seats: Seat[];
    aisleAfterColumn?: number;
  }
  
  export interface Booking {
    id: string;
    routeId: string;
    userId: string;
    seatIds: string[];
    totalPrice: number;
    bookingDate: string;
    travelDate: string;
    status: 'confirmed' | 'cancelled' | 'completed';
    paymentMethod: string;
    qrCode?: string;
  }
  
  export interface User {
    _id: string;
    fullName: string;
    phone: string;
    email: string;
    citizenId: string;
    dateOfBirth: string;
    role: string;
    gender: string;
    address: string;
    bookings: Booking[];
  }
  
  export interface SearchParams {
    from: string;
    to: string;
    date: Date | null;
  }
  
  export interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
  }
  
  export type City = {
    id: string;
    name: string;
  };
  
  export interface Station {
    _id: string;
    name: string;
    code: string;
    address: {
      street: string;
      ward: string;
      district: string;
      city: string;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Trip {
    _id: string;
    route: Route;
    bus: {
      _id: string;
      name: string;
      type: string;
      capacity: number;
      licensePlate: string;
    };
    tripCode: string;
    departureDate: string;
    departureTime: string;
    arrivalTime: string;
    basePrice: number;
    status: string;
    availableSeats: number;
  }