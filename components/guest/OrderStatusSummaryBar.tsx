'use client';

import { Clock, Package, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order } from '@/lib/api';
import { ErrorState } from '@/components/shared/ErrorState';
import { getOrderStatusMeta } from '@/lib/utils/status-meta';

interface OrderStatusSummaryBarProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  currentFilter: Order['status'] | 'all';
  onFilterChange: (next: Order['status'] | 'all') => void;
  onRetry?: () => void;
}

const STATUS_CHIPS: Array<{
  key: Order['status'] | 'all';
  label: string;
  icon?: typeof Clock;
}> = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: getOrderStatusMeta('pending').label, icon: Clock },
  { key: 'preparing', label: getOrderStatusMeta('preparing').label, icon: Package },
  { key: 'completed', label: getOrderStatusMeta('completed').label, icon: CheckCircle },
];

export function OrderStatusSummaryBar({
  orders,
  loading,
  error,
  currentFilter,
  onFilterChange,
  onRetry,
}: OrderStatusSummaryBarProps) {
  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing' || o.status === 'delivering').length,
    completed: orders.filter((o) => o.status === 'completed').length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="주문 상태를 불러오지 못했어요" description={error} onRetry={onRetry} />;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <p className="text-sm font-semibold mb-3">주문 상태</p>
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 [-webkit-overflow-scrolling:touch]">
          {STATUS_CHIPS.map((chip) => {
            const Icon = chip.icon;
            const isActive = currentFilter === chip.key;
            const count = statusCounts[chip.key as keyof typeof statusCounts];

            return (
              <Button
                key={chip.key}
                type="button"
                size="sm"
                variant={isActive ? 'default' : 'outline'}
                className="shrink-0 h-8 px-3 text-xs font-semibold"
                onClick={() => onFilterChange(chip.key)}
                aria-pressed={isActive}
                aria-label={`${chip.label} 주문 보기 (${count})`}
              >
                {Icon ? <Icon className="h-3 w-3 mr-1" aria-hidden="true" /> : null}
                {chip.label} {count}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

