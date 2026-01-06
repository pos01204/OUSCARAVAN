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

/**
 * API 응답 타입
 */

// 인증 응답
export interface AuthResponse {
  token: string;
  expiresIn: number;
}

// 예약 목록 응답
export interface ReservationsResponse {
  reservations: Reservation[];
  total: number;
}

// 주문 목록 응답
export interface OrdersResponse {
  orders: Order[];
  total: number;
}

// 방 목록 응답
export interface RoomsResponse {
  rooms: Room[];
  total: number;
}

// 체크인/체크아웃 응답
export interface CheckInOutResponse {
  id: string;
  reservationId: string;
  type: 'checkin' | 'checkout';
  timestamp: string;
  checklist?: {
    gasLocked: boolean;
    trashCleaned: boolean;
  };
  notes?: string;
  createdAt: string;
}

/**
 * API 에러 타입
 */

// 에러 코드 타입
export type ApiErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_ENTRY'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR';

// API 에러 응답
export interface ApiErrorResponse {
  error: string;
  code?: ApiErrorCode;
  details?: Record<string, unknown>;
}

// API 에러 클래스
export class ApiError extends Error {
  code?: ApiErrorCode;
  status?: number;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code?: ApiErrorCode,
    status?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
