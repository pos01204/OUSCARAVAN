'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type Reservation } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { calculateTotalAmount } from '@/lib/utils/reservation';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import { RoomAssignmentDrawer } from '@/components/admin/RoomAssignmentDrawer';

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
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Quick Assignment State
  const [assigningReservation, setAssigningReservation] = useState<Reservation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { ref, isPulling, pullDistance, isRefreshing, pullProgress, handlers } = usePullToRefresh({
    onRefresh: async () => {
      router.refresh();
    },
    enabled: isMobile,
  });

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

  const handleQuickAssign = (reservation: Reservation) => {
    setAssigningReservation(reservation);
    setIsDrawerOpen(true);
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
    <>
      <div
        ref={ref}
        className="space-y-4 relative pb-0"
        {...handlers}
      >
        {isPulling && (
          <div
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity"
            style={{
              height: `${Math.min(pullDistance, 80)}px`,
              opacity: pullProgress,
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <RefreshCw
                className={cn(
                  "h-6 w-6 text-primary transition-transform",
                  isRefreshing && "animate-spin"
                )}
                style={{
                  transform: `rotate(${pullProgress * 180}deg)`,
                }}
              />
              <p className="text-sm text-muted-foreground">
                {pullDistance >= 80 ? '놓으면 새로고침' : '아래로 당겨서 새로고침'}
              </p>
            </div>
          </div>
        )}

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
            onQuickAssign={handleQuickAssign}
          />
        ))}
      </div>

      <RoomAssignmentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        reservation={assigningReservation}
        onAssignSuccess={() => {
          setIsDrawerOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

function ReservationCard({
  reservation,
  getStatusBadge,
  onQuickAssign,
}: {
  reservation: Reservation;
  getStatusBadge: (status: Reservation['status']) => JSX.Element;
  onQuickAssign: (reservation: Reservation) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { totalAmount, roomAmount, optionsAmount } = calculateTotalAmount(reservation);

  return (
    <Card className="mb-3">
      <CardHeader
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${reservation.guestName}님 예약 상세 정보 ${isExpanded ? '접기' : '펼치기'}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
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
              aria-hidden="true"
            />
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
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

          <div className="flex gap-2">
            {!reservation.assignedRoom && (
              <Button
                variant="default"
                className="flex-1 min-h-[44px]"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAssign(reservation);
                }}
              >
                방 배정하기
              </Button>
            )}
            <Link href={`/admin/reservations/${reservation.id}`} className={!reservation.assignedRoom ? 'flex-1' : 'w-full'}>
              <Button
                variant="outline"
                className="w-full min-h-[44px]"
                aria-label={`${reservation.guestName}님 예약 상세 페이지로 이동`}
              >
                상세보기
              </Button>
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
