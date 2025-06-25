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
    _id: string;
    bookingCode: string;
    customer: User; // Types.ObjectId hoặc populated object
    trip: Trip; // Types.ObjectId hoặc populated object với route
    pickupStation: Station; // Types.ObjectId hoặc populated object
    dropoffStation: Station; // Types.ObjectId hoặc populated object
    seatNumbers: string[];
    totalAmount: number;
    bookingStatus?: "pending" | "confirmed" | "paid" | "cancelled";
    paymentStatus?: "unpaid" | "paid" | "failed";
    paymentMethod?:
      | "cash"
      | "bank_transfer"
      | "credit_card"
      | "e_wallet"
      | "online";
    paymentDate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
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
  
  export interface Driver {
    _id?: string;
    fullName: string;
    phone?: string;
    email?: string;
    licenseNumber: string;
    status?: "active" | "inactive" | "suspended";
    operator: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Bus {
    _id?: string;
    operator: string; // BusOperator ID
    licensePlate: string;
    busType: "standard" | "sleeper" | "limousine" | "vip";
    seatCount: number;
    status?: "active" | "maintenance" | "inactive";
    createdAt?: string;
    updatedAt?: string;
  }