'use client';

import { useState } from 'react';
import { CouponFlip } from '@/components/features/CouponFlip';
import { MenuCarousel } from '@/components/features/MenuCarousel';
import { OrderForm } from '@/components/features/OrderForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Phone } from 'lucide-react';
import { CAFE_INFO } from '@/lib/constants';
import { useGuestStore } from '@/lib/store';

export default function MarketPage() {
  const { guestInfo } = useGuestStore();
  const [showOrderForm, setShowOrderForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Golden Ticket */}
      <CouponFlip roomNumber={guestInfo.room} />

      {/* Menu Showcase */}
      <div>
        <h2 className="mb-4 text-xl font-heading font-bold">시그니처 메뉴</h2>
        <MenuCarousel />
      </div>

      {/* BBQ & Fire Sets */}
      <div>
        <h2 className="mb-4 text-xl font-heading font-bold">
          불멍/바베큐 주문
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>세트 메뉴</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              원하는 세트를 선택하여 주문하세요. 배송 시간을 지정할 수
              있습니다.
            </p>
            <button
              onClick={() => setShowOrderForm(true)}
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              주문하기
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Cafe Info */}
      <Card>
        <CardHeader>
          <CardTitle>{CAFE_INFO.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">운영 시간</p>
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
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">위치</p>
              <p className="text-sm text-muted-foreground">
                {CAFE_INFO.address}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">연락처</p>
              <a
                href={`tel:${CAFE_INFO.phone}`}
                className="text-sm text-primary hover:underline"
              >
                {CAFE_INFO.phone}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Form Modal */}
      {showOrderForm && (
        <OrderForm onClose={() => setShowOrderForm(false)} />
      )}
    </div>
  );
}
