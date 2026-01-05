'use client';

import { useState } from 'react';
import { Package, Clock, CheckCircle2, Truck, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGuestStore, type Order } from '@/lib/store';
import { formatDateTime } from '@/lib/utils';

type OrderStatus = Order['status'] | 'all';

const statusConfig = {
  pending: {
    label: '대기 중',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  preparing: {
    label: '준비 중',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  delivering: {
    label: '배송 중',
    icon: Truck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  completed: {
    label: '완료',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
};

export function OrderHistory() {
  const { orders } = useGuestStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>주문 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            주문 내역이 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>주문 내역</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus)}
                className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              >
                <option value="all">전체</option>
                <option value="pending">대기 중</option>
                <option value="preparing">준비 중</option>
                <option value="delivering">배송 중</option>
                <option value="completed">완료</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {statusFilter === 'all'
                ? '주문 내역이 없습니다.'
                : '해당 상태의 주문이 없습니다.'}
            </p>
          ) : (
            filteredOrders.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;

            return (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${config.color}`} />
                      <span className="font-semibold">
                        {order.type === 'bbq' ? '바베큐' : '불멍'} 세트
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </p>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {order.totalAmount.toLocaleString()}원
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-medium ${config.bgColor} ${config.color}`}
                  >
                    {config.label}
                  </div>
                </div>
              </button>
            );
            })
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>주문 상세</DialogTitle>
              <DialogDescription>
                주문 번호: {selectedOrder.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium">주문 시간</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>
              {selectedOrder.deliveryTime && (
                <div>
                  <p className="text-sm font-medium">배송 시간</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.deliveryTime}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">주문 항목</p>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-muted p-2"
                    >
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">
                        {item.quantity}개 × {item.price.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedOrder.notes && (
                <div>
                  <p className="text-sm font-medium">요청사항</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
              <div className="rounded-lg bg-primary/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">총액</span>
                  <span className="text-xl font-bold text-primary">
                    {selectedOrder.totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
