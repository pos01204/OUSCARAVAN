'use client';

import { format, isSameDay } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type Reservation } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculateTotalAmount } from '@/lib/utils/reservation';

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
    const variants: Record<Reservation['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: '대기', variant: 'outline' },
      assigned: { label: '배정 완료', variant: 'secondary' },
      checked_in: { label: '체크인', variant: 'default' },
      checked_out: { label: '체크아웃', variant: 'secondary' },
      cancelled: { label: '취소', variant: 'destructive' },
    };
    const { label, variant } = variants[status];
    return <Badge variant={variant} className="text-xs">{label}</Badge>;
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors border"
      onClick={() => onViewDetail(reservation.id)}
    >
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* 왼쪽: 예약 정보 */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* 이름 및 배지 */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-base md:text-lg">
                {reservation.guestName}
              </h4>
              {getStatusBadge(reservation.status)}
              {checkinCheckoutBadges}
            </div>
            
            {/* 예약 상세 정보 */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground min-w-[80px]">예약번호:</span>
                <span className="text-foreground">{reservation.reservationNumber}</span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-muted-foreground min-w-[80px]">체크인:</span>
                <span className="text-foreground">{format(checkin, 'yyyy-MM-dd')}</span>
                {isCheckinDay && (
                  <Badge variant="outline" className="text-xs">체크인일</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-muted-foreground min-w-[80px]">체크아웃:</span>
                <span className="text-foreground">{format(checkout, 'yyyy-MM-dd')}</span>
                {isCheckoutDay && (
                  <Badge variant="outline" className="text-xs">체크아웃일</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground min-w-[80px]">방 배정:</span>
                <span className={reservation.assignedRoom ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                  {reservation.assignedRoom || '미배정'}
                </span>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="font-medium text-muted-foreground min-w-[80px]">객실:</span>
                <span className="text-foreground break-words">{reservation.roomType}</span>
              </div>
              
              {reservation.options && reservation.options.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-medium text-muted-foreground min-w-[80px]">옵션:</span>
                  <div className="flex flex-wrap gap-1">
                    {reservation.options.map((opt, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {opt.optionName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 오른쪽: 금액 및 버튼 */}
          <div className="flex-shrink-0 flex flex-col items-end md:items-end gap-3">
            <div className="text-lg md:text-xl font-bold text-primary">
              {totalAmount.toLocaleString()}원
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                className="min-h-[36px] text-xs md:text-sm"
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
                  className="min-h-[36px] text-xs md:text-sm"
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
