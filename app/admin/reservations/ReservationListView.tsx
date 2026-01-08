'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type Reservation } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { calculateTotalAmount } from '@/lib/utils/reservation';
import { cn } from '@/lib/utils';

interface ReservationListViewProps {
  reservations: Reservation[];
  total?: number;
  search?: string;
  status?: string;
  checkin?: string;
  checkout?: string;
}

export function ReservationListView({
  reservations,
  total,
  search,
  status,
  checkin,
  checkout,
}: ReservationListViewProps) {
  const getStatusBadge = (status: Reservation['status']) => {
    const variants: Record<Reservation['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: '대기', variant: 'outline' },
      assigned: { label: '배정 완료', variant: 'secondary' },
      checked_in: { label: '체크인', variant: 'default' },
      checked_out: { label: '체크아웃', variant: 'secondary' },
      cancelled: { label: '취소', variant: 'destructive' },
    };
    
    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            {search || status || checkin || checkout
              ? '검색 결과가 없습니다.'
              : '등록된 예약이 없습니다.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {total !== undefined && total > 0 && (
        <p className="text-sm text-muted-foreground">
          총 {total}건의 예약이 있습니다.
        </p>
      )}
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          getStatusBadge={getStatusBadge}
        />
      ))}
    </div>
  );
}

// Phase 2: 접이식 카드 컴포넌트
function ReservationCard({
  reservation,
  getStatusBadge,
}: {
  reservation: Reservation;
  getStatusBadge: (status: Reservation['status']) => JSX.Element;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { totalAmount, roomAmount, optionsAmount } = calculateTotalAmount(reservation);

  return (
    <Card className="mb-3">
      <CardHeader
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-1 truncate">
              {reservation.guestName}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span>{reservation.checkin}</span>
              <span>→</span>
              <span>{reservation.checkout}</span>
              {reservation.assignedRoom && (
                <>
                  <span>·</span>
                  <span className="font-medium text-foreground">
                    {reservation.assignedRoom}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge(reservation.status)}
            <ChevronDown
              className={cn(
                'h-5 w-5 transition-transform text-muted-foreground',
                isExpanded ? 'rotate-180' : ''
              )}
            />
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
          {/* 상세 정보 */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">예약번호</p>
              <p className="font-medium">{reservation.reservationNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">배정된 방</p>
              <p className="font-medium">
                {reservation.assignedRoom || '미배정'}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs mb-1">예약 상품</p>
              <p className="font-medium">{reservation.roomType}</p>
              {reservation.options && reservation.options.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {reservation.options.map((option, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {option.optionName}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs mb-1">결제금액</p>
              <p className="font-bold text-lg text-primary">
                {totalAmount.toLocaleString()}원
              </p>
              {reservation.options && reservation.options.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  (객실: {roomAmount.toLocaleString()}원
                  + 옵션: {optionsAmount.toLocaleString()}원)
                </p>
              )}
            </div>
          </div>

          <Link href={`/admin/reservations/${reservation.id}`}>
            <Button className="w-full min-h-[44px]" size="lg">
              상세보기
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  );
}
