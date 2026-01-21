'use client';

import { useMemo, useState } from 'react';
import { CouponFlip } from '@/components/features/CouponFlip';
import { OrderForm } from '@/components/features/OrderForm';
import { OrderHistory } from '@/components/features/OrderHistory';
import { CafeInfoTab } from '@/components/features/CafeInfoTab';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Flame, Coffee } from 'lucide-react';
import { useGuestStore } from '@/lib/store';
import { GUEST_BRAND_MEDIA } from '@/lib/brand';
import { GuestPageHeader } from '@/components/guest/GuestPageHeader';
import { OrderStatusSummaryBar } from '@/components/guest/OrderStatusSummaryBar';
import { useGuestOrders } from '@/lib/hooks/useGuestOrders';
import type { Order } from '@/lib/api';

interface GuestOrderContentProps {
  token: string;
}

export function GuestOrderContent({ token }: GuestOrderContentProps) {
  const { guestInfo } = useGuestStore();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [reorderDraft, setReorderDraft] = useState<{
    selectedSetId: string;
    quantity: number;
    deliveryTime?: string;
    notes?: string;
  } | null>(null);

  const { orders, loading, error } = useGuestOrders(token);
  
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
    <main className="space-y-6" role="main" aria-label="주문 및 카페 이용 페이지">
      <GuestPageHeader
        title="주문 · 카페 이용"
        description="불멍/바베큐 세트를 주문하고 카페 할인을 받으세요"
      />

      {/* Golden Ticket - 공통 영역 */}
      <section aria-label="쿠폰">
        <CouponFlip roomNumber={guestInfo.room} backImageSrc={GUEST_BRAND_MEDIA.couponBackImageSrc} />
      </section>

      {/* 탭 네비게이션 */}
      <Tabs defaultValue="order" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1.5 bg-muted/40 border border-border/50 rounded-xl shadow-sm">
          <TabsTrigger
            value="order"
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all duration-200 text-sm font-bold data-[state=active]:scale-[1.02] hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="불멍/바베큐 주문 탭"
          >
            <Flame className="h-4 w-4 transition-transform data-[state=active]:scale-110" aria-hidden="true" />
            <span>불멍/바베큐</span>
          </TabsTrigger>
          <TabsTrigger
            value="cafe"
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all duration-200 text-sm font-bold data-[state=active]:scale-[1.02] hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="카페 이용 탭"
          >
            <Coffee className="h-4 w-4 transition-transform data-[state=active]:scale-110" aria-hidden="true" />
            <span>카페 이용</span>
          </TabsTrigger>
        </TabsList>

        {/* 주문 탭 */}
        <TabsContent 
          value="order" 
          className="mt-6 space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
        >
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
                    세트를 선택하고 원하는 시간에 배송받으세요
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
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                <h2 className="text-xl font-heading font-bold">주문 상태</h2>
              </div>
              <OrderStatusSummaryBar
                orders={bbqFireOrders}
                loading={loading}
                error={error}
                currentFilter={statusFilter}
                onFilterChange={setStatusFilter}
              />
            </section>

            <section aria-label="주문 내역" className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                <h2 className="text-xl font-heading font-bold">주문 내역</h2>
              </div>
              <OrderHistory
                token={token}
                orders={filteredOrders}
                loading={loading}
                error={error}
                onReorder={handleReorder}
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
        </TabsContent>

        {/* 카페 이용 탭 */}
        <TabsContent 
          value="cafe" 
          className="mt-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
        >
          <CafeInfoTab />
        </TabsContent>
      </Tabs>

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
