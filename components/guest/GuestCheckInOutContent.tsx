'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGuestStore } from '@/lib/store';
import type { Reservation } from '@/lib/api';
import { GuestPageHeader } from '@/components/guest/GuestPageHeader';
import { TimeCard } from '@/components/features/TimeCard';
import { CheckInOut } from '@/components/features/CheckInOut';

interface GuestCheckInOutContentProps {
  reservation: Reservation;
  token: string;
}

export function GuestCheckInOutContent({ reservation, token }: GuestCheckInOutContentProps) {
  const { setGuestInfo, isCheckedIn, isCheckedOut } = useGuestStore();
  
  useEffect(() => {
    // 다른 고객 페이지와 동일하게 게스트 정보를 설정 (체크인/체크아웃 페이지에서도 일관 동작)
    setGuestInfo({
      name: reservation.guestName,
      room: reservation.assignedRoom || '',
      checkinDate: reservation.checkin,
      checkoutDate: reservation.checkout,
    });

    // 서버 상태와 동기화 (새로고침 시 초기화 방지)
    if (reservation.status === 'checked_in') {
      if (!isCheckedIn) useGuestStore.getState().checkIn();
    } else if (reservation.status === 'checked_out') {
      if (!isCheckedIn) useGuestStore.getState().checkIn();
      if (!isCheckedOut) useGuestStore.getState().checkOut();
    }
  }, [reservation, setGuestInfo, isCheckedIn, isCheckedOut]);

  const formatYmd = (isoLike?: string) => {
    if (!isoLike) return '-';
    const d = new Date(isoLike);
    if (Number.isNaN(d.getTime())) return isoLike; // 혹시 포맷이 다르면 원문 유지
    const parts = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d);
    const y = parts.find((p) => p.type === 'year')?.value ?? '';
    const m = parts.find((p) => p.type === 'month')?.value ?? '';
    const day = parts.find((p) => p.type === 'day')?.value ?? '';
    return `${y}.${m}.${day}`;
  };
  
  return (
    <main className="space-y-6" role="main" aria-label="체크인/체크아웃 페이지">
      <GuestPageHeader
        title="체크인/체크아웃"
        description="체크인/체크아웃 시간과 상태를 확인하고, 버튼으로 간편하게 완료할 수 있어요."
      />

      {/* 안내 시간 (디자인 통일) */}
      <section aria-label="이용 시간 안내">
        <TimeCard />
      </section>

      {/* 체크인/체크아웃 액션 (디자인 통일) */}
      <section aria-label="체크인/체크아웃">
        <CheckInOut token={token} />
      </section>
      
      {/* 예약 정보 */}
      <section aria-label="예약 정보">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>예약 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">체크인</span>
              <span className="text-sm font-semibold text-brand-dark">{formatYmd(reservation.checkin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">체크아웃</span>
              <span className="text-sm font-semibold text-brand-dark">{formatYmd(reservation.checkout)}</span>
            </div>
            {/* 호수 정보는 고객에게 노출하지 않음 (관리자 편의용) */}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
