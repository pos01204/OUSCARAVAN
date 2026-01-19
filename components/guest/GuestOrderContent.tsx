'use client';

import { useMemo, useState } from 'react';
import { CouponFlip } from '@/components/features/CouponFlip';
import { OrderForm } from '@/components/features/OrderForm';
import { KioskOrderForm } from '@/components/features/KioskOrderForm';
import { OrderHistory } from '@/components/features/OrderHistory';
import { CafeInfoTab } from '@/components/features/CafeInfoTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShoppingBag, Coffee, Package } from 'lucide-react';
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
  const [showKioskOrderForm, setShowKioskOrderForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [reorderDraft, setReorderDraft] = useState<
    | null
    | {
        kind: 'bbq_fire';
        selectedSetId: string;
        quantity: number;
        deliveryTime?: string;
        notes?: string;
      }
    | {
        kind: 'kiosk';
        cart: Array<{ id: string; name: string; price: number; quantity: number }>;
        deliveryTime?: string;
        notes?: string;
      }
  >(null);

  const { orders, loading, error } = useGuestOrders(token);
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleReorder = (order: Order) => {
    if (order.type === 'kiosk') {
      setReorderDraft({
        kind: 'kiosk',
        cart: order.items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        deliveryTime: order.deliveryTime,
        notes: order.notes,
      });
      setShowKioskOrderForm(true);
      return;
    }

    const first = order.items[0];
    if (!first?.id) return;
    setReorderDraft({
      kind: 'bbq_fire',
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
        description="원하는 상품을 선택하고 배송 시간을 지정할 수 있어요"
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
            aria-label="주문 탭"
          >
            <ShoppingBag className="h-4 w-4 transition-transform data-[state=active]:scale-110" aria-hidden="true" />
            <span>주문</span>
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
        <section aria-label="주문 상태 및 내역" className="space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">주문 상태</CardTitle>
              <CardDescription>주문 상태를 확인하고 원하는 서비스를 바로 선택하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <OrderStatusSummaryBar
                orders={orders}
                loading={loading}
                error={error}
                currentFilter={statusFilter}
                onFilterChange={setStatusFilter}
              />
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReorderDraft(null);
                    setShowOrderForm(true);
                  }}
                  className="w-full"
                >
                  배송 주문 (불멍/바베큐 세트)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setReorderDraft(null);
                    setShowKioskOrderForm(true);
                  }}
                  className="w-full"
                >
                  키오스크 판매 물품 주문
                </Button>
              </div>
            </CardContent>
          </Card>

          <section aria-label="주문 내역">
            <div className="flex items-center gap-2 mb-4">
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
        </section>
        </TabsContent>

        {/* 카페 이용 탭 */}
        <TabsContent 
          value="cafe" 
          className="mt-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
        >
          <CafeInfoTab />
        </TabsContent>
      </Tabs>

      {/* Order Form Modals */}
      {showOrderForm && (
        <OrderForm
          onClose={() => setShowOrderForm(false)}
          token={token}
          initial={
            reorderDraft?.kind === 'bbq_fire'
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
      {showKioskOrderForm && (
        <KioskOrderForm
          onClose={() => setShowKioskOrderForm(false)}
          token={token}
          initial={
            reorderDraft?.kind === 'kiosk'
              ? {
                  cart: reorderDraft.cart,
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
