'use client';

import { useMemo, useState } from 'react';
import { OrderForm } from '@/components/features/OrderForm';
import { OrderHistory } from '@/components/features/OrderHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, RotateCcw } from 'lucide-react';
import { GuestPageHeader } from '@/components/guest/GuestPageHeader';
import { OrderStatusSummaryBar } from '@/components/guest/OrderStatusSummaryBar';
import { useGuestOrders } from '@/lib/hooks/useGuestOrders';
import type { Order } from '@/lib/api';
import { LastUpdatedAt } from '@/components/shared/LastUpdatedAt';

interface GuestOrderContentProps {
  token: string;
}

export function GuestOrderContent({ token }: GuestOrderContentProps) {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [reorderDraft, setReorderDraft] = useState<{
    selectedSetId: string;
    quantity: number;
    deliveryTime?: string;
    notes?: string;
  } | null>(null);

  const { orders, loading, isRefreshing, error, refresh, lastUpdatedAt } = useGuestOrders(token);

  // 키오스크 주문은 현장 수령이므로 bbq/fire 주문만 표시
  const bbqFireOrders = useMemo(() => {
    return orders.filter((o) => o.type === 'bbq' || o.type === 'fire');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return bbqFireOrders;
    if (statusFilter === 'preparing') {
      return bbqFireOrders.filter((o) => o.status === 'preparing' || o.status === 'delivering');
    }
    return bbqFireOrders.filter((o) => o.status === statusFilter);
  }, [bbqFireOrders, statusFilter]);

  const handleReorder = (order: Order) => {
    // 키오스크 주문은 재주문 불가 (현장 수령)
    if (order.type === 'kiosk') return;

    const first = order.items[0];
    if (!first?.id) return;
    setReorderDraft({
      selectedSetId: first.id,
      quantity: first.quantity ?? 1,
      deliveryTime: order.deliveryTime,
      notes: order.notes,
    });
    setShowOrderForm(true);
  };

  return (
    <main className="space-y-6" role="main" aria-label="불멍/바베큐 주문 페이지">
      <GuestPageHeader
        title="불멍/바베큐 주문"
        description="세트를 선택하고 원하는 시간에 배송받으세요"
      />

      {/* 불멍/바베큐 주문 카드 */}
      <section aria-label="불멍/바베큐 주문">
        <Card className="border-border/60 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2.5 rounded-xl bg-orange-50">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <span className="block">불멍/바베큐 세트</span>
                <CardDescription className="mt-1 font-normal">
                  바베큐 세트, 불멍 세트 등 다양한 옵션을 선택할 수 있어요
                </CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                setReorderDraft(null);
                setShowOrderForm(true);
              }}
            >
              <Flame className="mr-2 h-4 w-4" />
              주문하기
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* 주문 상태 & 내역 */}
      {bbqFireOrders.length > 0 && (
        <>
          <section aria-label="주문 상태" className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-1 w-1 rounded-full bg-primary shrink-0"></div>
                <h2 className="text-xl font-heading font-bold whitespace-nowrap">주문 상태</h2>
              </div>
              <div className="flex items-center justify-end gap-2">
                <LastUpdatedAt value={lastUpdatedAt} className="text-right" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={refresh}
                  disabled={isRefreshing}
                  aria-label="주문 상태 새로고침"
                >
                  <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                </Button>
              </div>
            </div>
            <OrderStatusSummaryBar
              orders={bbqFireOrders}
              loading={loading}
              error={error}
              currentFilter={statusFilter}
              onFilterChange={setStatusFilter}
              onRetry={refresh}
            />
          </section>

          <section aria-label="주문 내역" className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-1 w-1 rounded-full bg-primary shrink-0"></div>
                <h2 className="text-xl font-heading font-bold whitespace-nowrap">주문 내역</h2>
              </div>
              <div className="flex items-center justify-end gap-2">
                <LastUpdatedAt value={lastUpdatedAt} className="text-right" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={refresh}
                  disabled={isRefreshing}
                  aria-label="주문 내역 새로고침"
                >
                  <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                </Button>
              </div>
            </div>
            <OrderHistory
              token={token}
              orders={filteredOrders}
              loading={loading}
              error={error}
              onReorder={handleReorder}
              onRetry={refresh}
            />
          </section>
        </>
      )}

      {/* 주문 내역이 없을 때 */}
      {!loading && bbqFireOrders.length === 0 && (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-8 text-center">
            <Flame className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              아직 주문 내역이 없습니다
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              불멍/바베큐 세트를 주문해보세요!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <OrderForm
          onClose={() => setShowOrderForm(false)}
          token={token}
          initial={
            reorderDraft
              ? {
                  selectedSetId: reorderDraft.selectedSetId,
                  quantity: reorderDraft.quantity,
                  deliveryTime: reorderDraft.deliveryTime,
                  notes: reorderDraft.notes,
                  step: 'review',
                }
              : undefined
          }
        />
      )}
    </main>
  );
}
