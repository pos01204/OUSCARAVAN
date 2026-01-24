import type { Order } from '@/lib/api';
import type { Reservation } from '@/types';

export type StatusMeta<TStatus extends string = string> = {
  status: TStatus;
  label: string;
  className: string;
  next?: TStatus | null;
};

export type OrderStatus = Order['status'];
export type ReservationStatus = Reservation['status'];

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta<OrderStatus>> = {
  pending: {
    status: 'pending',
    label: '대기',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    next: 'preparing',
  },
  preparing: {
    status: 'preparing',
    label: '준비중',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    next: 'completed',
  },
  delivering: {
    status: 'delivering',
    label: '배송중',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    next: 'completed',
  },
  completed: {
    status: 'completed',
    label: '완료',
    className: 'bg-green-100 text-green-800 border-green-200',
    next: null,
  },
};

export const RESERVATION_STATUS_META: Record<ReservationStatus, StatusMeta<ReservationStatus>> = {
  pending: {
    status: 'pending',
    label: '대기',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  assigned: {
    status: 'assigned',
    label: '배정 완료',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  checked_in: {
    status: 'checked_in',
    label: '체크인',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  checked_out: {
    status: 'checked_out',
    label: '체크아웃',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  cancelled: {
    status: 'cancelled',
    label: '취소',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

export function getOrderStatusMeta(status: OrderStatus): StatusMeta<OrderStatus> {
  return ORDER_STATUS_META[status] || {
    status,
    label: '상태',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    next: null,
  };
}

export function getReservationStatusMeta(
  status: ReservationStatus
): StatusMeta<ReservationStatus> {
  return RESERVATION_STATUS_META[status] || {
    status,
    label: '상태',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  };
}

export function getNextOrderStatus(status: OrderStatus): OrderStatus | null {
  return getOrderStatusMeta(status).next ?? null;
}
