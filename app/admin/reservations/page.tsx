import Link from 'next/link';
import { Suspense } from 'react';
import { getReservations, type Reservation } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ReservationFiltersClient } from './ReservationFiltersClient';

// 예약 목록 컴포넌트
async function ReservationsList({
  status,
  checkin,
  checkout,
  search,
}: {
  status?: string;
  checkin?: string;
  checkout?: string;
  search?: string;
}) {
  // Railway 백엔드 API에서 예약 목록 조회
  let reservations: Reservation[] = [];
  let total = 0;
  
  try {
    const data = await getReservations({
      status,
      checkin,
      checkout,
      search,
    });
    reservations = data.reservations || [];
    total = data.total || 0;
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
      {total > 0 && (
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
  );
}

// 로딩 스켈레톤
function ReservationsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 메인 페이지 컴포넌트
export default async function ReservationsPage({
  searchParams,
}: {
  searchParams?: {
    status?: string;
    checkin?: string;
    checkout?: string;
    search?: string;
  };
}) {
  const status = searchParams?.status;
  const checkin = searchParams?.checkin;
  const checkout = searchParams?.checkout;
  const search = searchParams?.search;
  
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
      
      <ReservationFiltersClient />
      
      <Suspense fallback={<ReservationsSkeleton />}>
        <ReservationsList
          status={status}
          checkin={checkin}
          checkout={checkout}
          search={search}
        />
      </Suspense>
    </div>
  );
}
