import { Suspense } from 'react';
import { getReservationsServer } from '@/lib/admin-api-server';
import { type Reservation } from '@/lib/api';
import { logError } from '@/lib/logger';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReservationFiltersClient } from './ReservationFiltersClient';
import { ReservationsViewClient } from './ReservationsViewClient';

// 예약 데이터 조회 컴포넌트 (서버 컴포넌트)
async function ReservationsData({
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
    const data = await getReservationsServer({
      status,
      checkin,
      checkout,
      search,
    });
    reservations = data.reservations || [];
    total = data.total || 0;
  } catch (error) {
    logError('Failed to fetch reservations', error, {
      component: 'ReservationsData',
      filters: { status, checkin, checkout, search },
    });
  }
  
  return (
    <ReservationsViewClient
      reservations={reservations}
      total={total}
      search={search}
      status={status}
      checkin={checkin}
      checkout={checkout}
    />
  );
}

// 로딩 스켈레톤
function ReservationsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-48" />
      </div>
      <Card className="h-[600px]">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
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
        <ReservationsData
          status={status}
          checkin={checkin}
          checkout={checkout}
          search={search}
        />
      </Suspense>
    </div>
  );
}
