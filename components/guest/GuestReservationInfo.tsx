'use client';

import { useEffect, useState } from 'react';
import { guestApi, type Reservation } from '@/lib/api';
import { calculateTotalAmount } from '@/lib/utils/reservation';

interface GuestReservationInfoProps {
  token: string;
  initialReservation: Reservation;
}

export function GuestReservationInfo({ token, initialReservation }: GuestReservationInfoProps) {
  const [reservation, setReservation] = useState<Reservation>(initialReservation);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 주기적으로 예약 정보 갱신 (30초마다)
  useEffect(() => {
    const interval = setInterval(async () => {
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
    }, 30000); // 30초마다 갱신

    return () => clearInterval(interval);
  }, [token]);

  const { totalAmount } = calculateTotalAmount(reservation);

  return (
    <div className="mb-4 rounded-lg bg-muted/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium">
            {reservation.guestName}님 · {reservation.assignedRoom || '방 미배정'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            체크인: {reservation.checkin} · 체크아웃: {reservation.checkout}
          </p>
        </div>
        {totalAmount > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">총 결제금액</p>
            <p className="text-sm font-bold text-primary">
              {totalAmount.toLocaleString()}원
            </p>
          </div>
        )}
        {isRefreshing && (
          <div className="text-xs text-muted-foreground">
            <span className="animate-pulse">갱신 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}
