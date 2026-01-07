import Link from 'next/link';
import { type Reservation } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        <Card key={reservation.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{reservation.guestName}</CardTitle>
                <CardDescription>
                  예약번호: {reservation.reservationNumber}
                </CardDescription>
              </div>
              {getStatusBadge(reservation.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">체크인</p>
                <p className="font-medium">{reservation.checkin}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">체크아웃</p>
                <p className="font-medium">{reservation.checkout}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">예약 상품</p>
                <div className="space-y-1">
                  <p className="font-medium">{reservation.roomType}</p>
                  {reservation.options && reservation.options.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {reservation.options.map((option, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {option.optionName}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">배정된 방</p>
                <p className="font-medium">
                  {reservation.assignedRoom || '미배정'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">결제금액</p>
                <p className="font-medium">
                  {(() => {
                    const roomAmount = parseInt(reservation.amount || '0');
                    const optionsAmount = reservation.options?.reduce((sum, opt) => sum + opt.optionPrice, 0) || 0;
                    return (roomAmount + optionsAmount).toLocaleString();
                  })()}원
                </p>
                {reservation.options && reservation.options.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    (객실: {parseInt(reservation.amount || '0').toLocaleString()}원
                    + 옵션: {reservation.options.reduce((sum, opt) => sum + opt.optionPrice, 0).toLocaleString()}원)
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/admin/reservations/${reservation.id}`}>
                <Button variant="outline" size="sm">
                  상세 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
