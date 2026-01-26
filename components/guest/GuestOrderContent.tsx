'use client';

import { useEffect, useMemo, useState } from 'react';
import { OrderForm } from '@/components/features/OrderForm';
import { OrderHistory } from '@/components/features/OrderHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { CheckCircle2, Flame, RotateCcw, X } from 'lucide-react';
import { GuestPageHeader } from '@/components/guest/GuestPageHeader';
import { OrderStatusSummaryBar } from '@/components/guest/OrderStatusSummaryBar';
import { useGuestOrders } from '@/lib/hooks/useGuestOrders';
import type { Order } from '@/lib/api';
import { LastUpdatedAt } from '@/components/shared/LastUpdatedAt';
import { SectionHeader } from '@/components/shared/SectionHeader';

interface GuestOrderContentProps {
  token: string;
}

export function GuestOrderContent({ token }: GuestOrderContentProps) {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [submittedToast, setSubmittedToast] = useState<{
    at: Date;
    setName: string;
    quantity: number;
    deliveryTime: string;
    totalAmount: number;
  } | null>(null);
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

  useEffect(() => {
    if (!submittedToast) return;
    const id = window.setTimeout(() => setSubmittedToast(null), 12_000);
    return () => window.clearTimeout(id);
  }, [submittedToast]);

  return (
    <main className="space-y-6" role="main" aria-label="불멍/바베큐 주문 페이지">
      <GuestPageHeader
        title="불멍/바베큐 주문"
        description="세트를 선택하고 원하는 시간에 배송받으세요"
      />

      {submittedToast ? (
        <Card variant="info">
          <CardContent className="flex items-start justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">주문이 접수되었어요</p>
                <p className="mt-1 text-xs text-emerald-800/90">
                  {submittedToast.setName} · {submittedToast.quantity}개 · {submittedToast.deliveryTime} ·{' '}
                  {submittedToast.totalAmount.toLocaleString()}원
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSubmittedToast(null)}
              aria-label="주문 접수 안내 닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* 불멍/바베큐 주문 카드 */}
      <section aria-label="불멍/바베큐 주문">
        <Card variant="cta" className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <CardIconBadge icon={Flame} tone="warning" />
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
            <SectionHeader
              title="주문 상태"
              rightSlot={
                <div className="flex items-center justify-end gap-1.5">
                  <LastUpdatedAt value={lastUpdatedAt} compact className="text-right hidden sm:block" />
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
              }
            />
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
            <SectionHeader
              title="주문 내역"
              rightSlot={
                <div className="flex items-center justify-end gap-1.5">
                  <LastUpdatedAt value={lastUpdatedAt} compact className="text-right hidden sm:block" />
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
              }
            />
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
        <Card variant="cta" className="border-dashed">
          <CardContent className="py-8 text-center">
            <Flame className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3 empty-icon" />
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
          onSubmitted={(data) => {
            setSubmittedToast({
              at: new Date(),
              setName: data.setName,
              quantity: data.quantity,
              deliveryTime: data.deliveryTime,
              totalAmount: data.totalAmount,
            });
            // 주문 접수 직후에는 상태가 바뀌었는지 바로 보이도록 한 번 즉시 갱신
            refresh();
          }}
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
