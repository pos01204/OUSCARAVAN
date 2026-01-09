'use client';

import { useState } from 'react';
import { CouponFlip } from '@/components/features/CouponFlip';
import { MenuCarousel } from '@/components/features/MenuCarousel';
import { OrderForm } from '@/components/features/OrderForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Phone } from 'lucide-react';
import { CAFE_INFO } from '@/lib/constants';
import { useGuestStore } from '@/lib/store';

interface GuestOrderContentProps {
  token: string;
}

export function GuestOrderContent({ token }: GuestOrderContentProps) {
  const { guestInfo } = useGuestStore();
  const [showOrderForm, setShowOrderForm] = useState(false);

  return (
    <main className="space-y-6" role="main" aria-label="주문 페이지">
      {/* Golden Ticket */}
      <section aria-label="쿠폰">
        <CouponFlip roomNumber={guestInfo.room} />
      </section>

      {/* Menu Showcase */}
      <section aria-label="메뉴">
        <h2 className="mb-6 text-2xl md:text-3xl font-heading font-black">메뉴</h2>
        <MenuCarousel />
      </section>

      {/* BBQ & Fire Sets */}
      <section aria-label="불멍/바베큐 주문">
        <h2 className="mb-4 text-xl font-heading font-bold">
          불멍/바베큐 주문
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>세트 메뉴</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              원하는 세트를 선택하여 주문하세요. 배송 시간을 지정할 수 있습니다.
            </p>
            <button
              onClick={() => setShowOrderForm(true)}
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="주문 폼 열기"
            >
              주문하기
            </button>
          </CardContent>
        </Card>
      </section>

      {/* Order Form Modal */}
      {showOrderForm && (
        <OrderForm
          onClose={() => setShowOrderForm(false)}
          token={token}
        />
      )}

      {/* Cafe Info */}
      <section aria-label="카페 정보">
        <Card>
          <CardHeader>
            <CardTitle>카페 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">매장 위치</p>
                <p className="text-sm text-muted-foreground">{CAFE_INFO.address}</p>
                <p className="text-xs text-muted-foreground mt-1">(매장 방문 및 길 안내용)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">운영 시간</p>
                <p className="text-sm text-muted-foreground">
                  평일: {CAFE_INFO.hours.weekday}
                </p>
                <p className="text-sm text-muted-foreground">
                  주말: {CAFE_INFO.hours.weekend}
                </p>
                <p className="mt-1 text-sm font-semibold text-destructive">
                  {CAFE_INFO.hours.closed}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">대표 전화번호</p>
                <a
                  href={`tel:${CAFE_INFO.phone.replace(/-/g, '')}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {CAFE_INFO.phone}
                </a>
                <p className="text-xs text-muted-foreground mt-1">
                  {CAFE_INFO.business.phoneType}
                </p>
              </div>
            </div>
            
            {/* 사업자 정보 */}
            <div className="pt-4 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-3">사업자 정보</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">상호명</span>
                  <span className="font-medium">{CAFE_INFO.business.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">대표자</span>
                  <span className="font-medium">{CAFE_INFO.business.representative}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">사업자등록번호</span>
                  <span className="font-medium">{CAFE_INFO.business.businessNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">업태/종목</span>
                  <span className="font-medium text-right max-w-[60%]">{CAFE_INFO.business.businessCategory}</span>
                </div>
                <div className="pt-2">
                  <p className="text-muted-foreground mb-1">사업장 주소 (등록)</p>
                  <p className="font-medium text-xs">{CAFE_INFO.business.registeredAddress}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
