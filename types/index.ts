/**
 * TypeScript 타입 정의
 */

export interface Reservation {
  id: string;
  reservationNumber: string;
  guestName: string;
  email: string;
  phone?: string;
  checkin: string;
  checkout: string;
  roomType: string;
  assignedRoom?: string;
  amount: string;
  status: 'pending' | 'assigned' | 'checked_in' | 'checked_out' | 'cancelled';
  uniqueToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  reservationId: string;
  type: 'bbq' | 'fire';
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'delivering' | 'completed';
  createdAt: string;
  deliveryTime?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  todayReservations: number;
  pendingCheckins: number;
  pendingCheckouts: number;
  pendingOrders: number;
}
