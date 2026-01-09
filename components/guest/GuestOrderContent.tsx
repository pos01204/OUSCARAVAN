'use client';

import { useState } from 'react';
import { CouponFlip } from '@/components/features/CouponFlip';
import { OrderForm } from '@/components/features/OrderForm';
import { KioskOrderForm } from '@/components/features/KioskOrderForm';
import { OrderHistory } from '@/components/features/OrderHistory';
import { CafeInfoTab } from '@/components/features/CafeInfoTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShoppingBag, Coffee, Package } from 'lucide-react';
import { useGuestStore } from '@/lib/store';

interface GuestOrderContentProps {
  token: string;
}

export function GuestOrderContent({ token }: GuestOrderContentProps) {
  const { guestInfo } = useGuestStore();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showKioskOrderForm, setShowKioskOrderForm] = useState(false);

  return (
    <main className="space-y-6" role="main" aria-label="주문 및 카페 이용 페이지">
      {/* Golden Ticket - 공통 영역 */}
      <section aria-label="쿠폰">
        <CouponFlip roomNumber={guestInfo.room} />
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
          {/* 배송 주문 섹션 */}
          <section aria-label="배송 주문" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <h2 className="text-xl md:text-2xl font-heading font-bold">
                배송 주문
              </h2>
            </div>
            
            {/* 불멍/바베큐 세트 */}
            <Card className="transition-all duration-200 hover:shadow-lg hover:border-primary/20 group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <span>불멍/바베큐 세트</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  원하는 세트를 선택하여 주문하세요. 배송 시간을 지정할 수 있습니다.
                </p>
                <button
                  onClick={() => setShowOrderForm(true)}
                  className="w-full rounded-lg bg-primary px-4 py-3.5 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg active:scale-[0.97] shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="불멍/바베큐 주문 폼 열기"
                >
                  주문하기
                </button>
              </CardContent>
            </Card>

            {/* 키오스크 물품 */}
            <Card className="transition-all duration-200 hover:shadow-lg hover:border-primary/20 group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <span>키오스크 판매 물품</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  음료, 간식, 생필품 등 키오스크에서 판매하는 물품을 주문하실 수 있습니다.
                </p>
                <button
                  onClick={() => setShowKioskOrderForm(true)}
                  className="w-full rounded-lg bg-primary px-4 py-3.5 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg active:scale-[0.97] shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="키오스크 주문 폼 열기"
                >
                  주문하기
                </button>
              </CardContent>
            </Card>
          </section>

          {/* 주문 내역 섹션 */}
          <section aria-label="주문 내역" className="pt-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <h2 className="text-xl md:text-2xl font-heading font-bold">
                주문 내역
              </h2>
            </div>
            <OrderHistory token={token} />
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
        />
      )}
      {showKioskOrderForm && (
        <KioskOrderForm
          onClose={() => setShowKioskOrderForm(false)}
          token={token}
        />
      )}
    </main>
  );
}
