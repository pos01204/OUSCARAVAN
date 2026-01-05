import Link from 'next/link';
import { adminApi, type Reservation } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function ReservationsPage() {
  // Railway 백엔드 API에서 예약 목록 조회
  // TODO: Railway 백엔드 API 구현 후 연동
  let reservations: Reservation[] = [];
  
  try {
    // reservations = await adminApi('/api/admin/reservations');
  } catch (error) {
    console.error('Failed to fetch reservations:', error);
  }
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">예약 관리</h1>
          <p className="text-muted-foreground">
            예약 목록 및 관리
          </p>
        </div>
      </div>
      
      {reservations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              등록된 예약이 없습니다.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Railway 백엔드 API 연동 후 예약 목록이 표시됩니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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
                    <p className="font-medium">{reservation.roomType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">배정된 방</p>
                    <p className="font-medium">
                      {reservation.assignedRoom || '미배정'}
                    </p>
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
      )}
    </div>
  );
}
