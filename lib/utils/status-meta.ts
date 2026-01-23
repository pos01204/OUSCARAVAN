import type { Order } from '@/lib/api';

export type StatusMeta<TStatus extends string = string> = {
  status: TStatus;
  label: string;
  className: string;
  next?: TStatus | null;
};

export type OrderStatus = Order['status'];

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

export function getOrderStatusMeta(status: OrderStatus): StatusMeta<OrderStatus> {
  return ORDER_STATUS_META[status] || {
    status,
    label: '상태',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    next: null,
  };
}

export function getNextOrderStatus(status: OrderStatus): OrderStatus | null {
  return getOrderStatusMeta(status).next ?? null;
}
