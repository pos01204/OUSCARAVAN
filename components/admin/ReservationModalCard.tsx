'use client';

import { format, isSameDay } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type Reservation } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/shared/StatusPill';
import { calculateTotalAmount } from '@/lib/utils/reservation';
import { getReservationStatusMeta } from '@/lib/utils/status-meta';

interface ReservationModalCardProps {
  reservation: Reservation;
  selectedDate: Date | null;
  onViewDetail: (id: string) => void;
  onCloseModal: () => void;
}

export function ReservationModalCard({
  reservation,
  selectedDate,
  onViewDetail,
  onCloseModal,
}: ReservationModalCardProps) {
  const router = useRouter();
  const checkin = new Date(reservation.checkin);
  const checkout = new Date(reservation.checkout);
  const isCheckinDay = selectedDate ? isSameDay(checkin, selectedDate) : false;
  const isCheckoutDay = selectedDate ? isSameDay(checkout, selectedDate) : false;
  const { totalAmount } = calculateTotalAmount(reservation);

  // 체크인/체크아웃 배지
  const checkinCheckoutBadges = [];
  if (isCheckinDay && isCheckoutDay) {
    checkinCheckoutBadges.push(
      <Badge key="both" variant="default" className="bg-purple-600 text-white text-xs">
        ✓→ 체크인+체크아웃
      </Badge>
    );
  } else if (isCheckinDay) {
    checkinCheckoutBadges.push(
      <Badge key="checkin" variant="default" className="bg-green-600 text-white text-xs">
        ✓ 체크인
      </Badge>
    );
  } else if (isCheckoutDay) {
    checkinCheckoutBadges.push(
      <Badge key="checkout" variant="default" className="bg-blue-600 text-white text-xs">
        → 체크아웃
      </Badge>
    );
  }

  // 상태 배지
  const getStatusBadge = (status: Reservation['status']) => {
    const meta = getReservationStatusMeta(status);
    return <StatusPill label={meta.label} className={meta.className} />;
  };

  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-colors border shadow-md"
      onClick={() => onViewDetail(reservation.id)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* 왼쪽: 예약 정보 */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* 이름 및 배지 */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-base md:text-lg">
                {reservation.guestName}
              </h4>
              {getStatusBadge(reservation.status)}
              {checkinCheckoutBadges}
            </div>

            {/* 예약 상세 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground min-w-[60px]">예약번호:</span>
                <span className="text-foreground font-medium">{reservation.reservationNumber}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground min-w-[60px]">객실타입:</span>
                <span className="text-foreground break-words font-semibold text-primary">{reservation.roomType.split('(')[0]}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground min-w-[60px]">배정상태:</span>
                <span className={reservation.assignedRoom ? 'text-primary font-bold' : 'text-muted-foreground'}>
                  {reservation.assignedRoom || '미배정'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground min-w-[60px]">투숙일정:</span>
                <span className="text-foreground">
                  {format(checkin, 'yyyy.MM.dd')} ~ {format(checkout, 'yyyy.MM.dd')}
                </span>
              </div>
            </div>
          </div>

          {/* 오른쪽: 금액 및 버튼 */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-dashed">
            <div className="text-base md:text-xl font-black text-primary">
              {totalAmount.toLocaleString()}원
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs md:text-sm shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(reservation.id);
                }}
              >
                상세 보기
              </Button>
              {!reservation.assignedRoom && (
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 px-4 text-xs md:text-sm font-bold shadow-md transform active:scale-95 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/reservations/${reservation.id}`);
                    onCloseModal();
                  }}
                >
                  방 배정
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
