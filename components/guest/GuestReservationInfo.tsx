'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { guestApi, type Reservation } from '@/lib/api';
import { calculateTotalAmount } from '@/lib/utils/reservation';

interface GuestReservationInfoProps {
  token: string;
  initialReservation: Reservation;
}

export function GuestReservationInfo({ token, initialReservation }: GuestReservationInfoProps) {
  const [reservation, setReservation] = useState<Reservation>(initialReservation);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 예약 정보 갱신 함수
  const refreshReservation = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const updatedReservation = await guestApi(token);
      setReservation(updatedReservation);
    } catch (error) {
      console.error('Failed to refresh reservation info:', error);
      // 에러 발생 시 조용히 실패 (사용자에게 알리지 않음)
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  // 주기적으로 예약 정보 갱신 (10초마다)
  useEffect(() => {
    const interval = setInterval(refreshReservation, 10000); // 10초마다 갱신

    return () => clearInterval(interval);
  }, [refreshReservation]);

  // 페이지 포커스 시 갱신
  useEffect(() => {
    const handleFocus = () => {
      refreshReservation();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshReservation]);

  const { totalAmount } = calculateTotalAmount(reservation);

  return (
    <div className="mb-4 rounded-lg bg-muted/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium">
            {reservation.guestName}님
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            체크인: {reservation.checkin} · 체크아웃: {reservation.checkout}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {totalAmount > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">총 결제금액</p>
              <p className="text-sm font-bold text-primary">
                {totalAmount.toLocaleString()}원
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshReservation}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
            title="새로고침"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
