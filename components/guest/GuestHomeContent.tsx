'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGuestStore } from '@/lib/store';
import { WifiCard } from '@/components/features/WifiCard';
import { TimeCard } from '@/components/features/TimeCard';
import { SunsetWidget } from '@/components/features/SunsetWidget';
import { CheckInOut } from '@/components/features/CheckInOut';
import { OrderHistory } from '@/components/features/OrderHistory';
import { CheckoutReminder } from '@/components/features/CheckoutReminder';
import { TimeCountdown } from '@/components/features/TimeCountdown';
import { GuestOrderSync } from '@/components/guest/GuestOrderSync';
import { FloorPlanCard } from '@/components/guest/FloorPlanCard';
import { WELCOME_MESSAGE } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { formatOptionName, calculateTotalAmount } from '@/lib/utils/reservation';
import { parseAmount, formatAmount } from '@/lib/utils/amount';
import type { Reservation } from '@/lib/api';

interface GuestHomeContentProps {
  reservation: Reservation;
  token: string;
}

export function GuestHomeContent({ reservation, token }: GuestHomeContentProps) {
  const { setGuestInfo, isCheckedIn } = useGuestStore();
  
  useEffect(() => {
    // Railway API에서 가져온 예약 정보로 게스트 정보 설정
    setGuestInfo({
      name: reservation.guestName,
      room: reservation.assignedRoom || '',
      checkinDate: reservation.checkin,
      checkoutDate: reservation.checkout,
    });
    
    // 자동 체크인 (체크인 날짜가 오늘인 경우)
    if (reservation.checkin && !isCheckedIn) {
      const today = new Date().toISOString().split('T')[0];
      if (reservation.checkin.startsWith(today)) {
        useGuestStore.getState().checkIn();
      }
    }
  }, [reservation, setGuestInfo, isCheckedIn]);
  
  return (
    <main className="space-y-6" role="main" aria-label="고객 홈 페이지">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 p-8 text-center border border-orange-100/50 shadow-sm"
        aria-label="환영 메시지"
      >
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {WELCOME_MESSAGE.korean.replace('{name}', reservation.guestName)}
        </h1>
        {/* 호수 정보는 고객에게 노출하지 않음 (관리자 편의용) */}
      </motion.section>
      
      {/* Checkout Reminder */}
      <CheckoutReminder />
      
      {/* Time Countdown */}
      <TimeCountdown />
      
      {/* 약도 카드 (체크인 완료 후 배정된 공간 표시) */}
      {reservation.assignedRoom && (
        <FloorPlanCard assignedRoom={reservation.assignedRoom} />
      )}
      
      {/* 주문 동기화 컴포넌트 (백그라운드에서 주기적으로 주문 목록 동기화) */}
      <GuestOrderSync token={token} />
      
      {/* Status Cards Grid */}
      <section className="grid gap-4 md:grid-cols-2" aria-label="서비스 정보 카드">
        <WifiCard />
        <TimeCard />
        <SunsetWidget />
        <CheckInOut token={token} />
      </section>
      
      {/* 예약 상품 및 옵션 정보 */}
      <section aria-label="예약 상품 정보">
        <Card>
          <CardHeader>
            <CardTitle>예약 상품 및 옵션</CardTitle>
            <CardDescription>주문한 상품과 옵션 내역</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ROOM 상품 */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">객실</Label>
              <div className="p-3 bg-muted rounded-md border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-relaxed break-words">
                      {reservation.roomType}
                    </p>
                    <Badge variant="outline" className="mt-1.5 text-xs">ROOM</Badge>
                  </div>
                  <div className="flex-shrink-0 sm:text-right">
                    <p className="font-semibold text-lg whitespace-nowrap">
                      {(() => {
                        const roomAmount = parseAmount(reservation.amount);
                        if (roomAmount === 0) {
                          return <span className="text-muted-foreground italic text-sm">금액 정보 없음</span>;
                        }
                        return formatAmount(roomAmount, true);
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* OPTION 상품들 */}
            {reservation.options && reservation.options.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">추가 옵션</Label>
                <div className="space-y-2">
                  {reservation.options.map((option, index) => {
                    const formatted = formatOptionName(option.optionName);
                    const hasPrice = option.optionPrice > 0;
                    
                    return (
                      <div key={index} className="p-3 bg-muted rounded-md border border-border/50">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* 태그들 (대괄호 내용) */}
                            {formatted.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-1.5">
                                {formatted.tags.map((tag, tagIndex) => (
                                  <Badge 
                                    key={tagIndex} 
                                    variant="outline" 
                                    className="text-xs px-1.5 py-0.5 h-auto font-normal"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {/* 메인 옵션명 */}
                            <p className="font-medium text-sm leading-relaxed break-words">
                              {formatted.mainName || formatted.fullName}
                            </p>
                            
                            {/* OPTION 배지 */}
                            <Badge variant="secondary" className="mt-1.5 text-xs">OPTION</Badge>
                          </div>
                          
                          {/* 가격 */}
                          <div className="flex-shrink-0 sm:text-right">
                            <p className={`font-semibold text-base whitespace-nowrap ${hasPrice ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {hasPrice ? (
                                `${option.optionPrice.toLocaleString()}원`
                              ) : (
                                <span className="italic text-sm">무료</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* 총 결제금액 */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">총 결제금액</Label>
                <p className="text-2xl font-bold text-primary">
                  {(() => {
                    const { totalAmount } = calculateTotalAmount(reservation);
                    return totalAmount.toLocaleString();
                  })()}원
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                객실: {calculateTotalAmount(reservation).roomAmount.toLocaleString()}원
                {reservation.options && reservation.options.length > 0 && (
                  <> + 옵션: {calculateTotalAmount(reservation).optionsAmount.toLocaleString()}원</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Order History */}
      <OrderHistory />
    </main>
  );
}
