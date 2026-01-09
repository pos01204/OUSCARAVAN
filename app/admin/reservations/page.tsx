import { Suspense } from 'react';
import { getReservationsServer } from '@/lib/admin-api-server';
import { type Reservation } from '@/lib/api';
import { logError } from '@/lib/logger';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReservationFiltersClient } from './ReservationFiltersClient';
import { ReservationsViewClient } from './ReservationsViewClient';
import { formatDateToISO } from '@/lib/utils/date';

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
  // 캘린더 뷰에서는 필터 없이 모든 예약을 가져와야 함
  // (필터는 리스트 뷰에서만 적용)
  let reservations: Reservation[] = [];
  let total = 0;

  try {
    // 캘린더를 위해 필터 없이 모든 예약 조회 (limit을 크게 설정)
    const data = await getReservationsServer({
      status: status && status !== 'all' ? status : undefined,
      // checkin, checkout 필터는 리스트 뷰에서만 사용
      // 캘린더는 모든 예약을 표시해야 하므로 필터 제거
      search,
      limit: 1000, // 충분히 큰 값으로 설정하여 모든 예약 가져오기
    });
    reservations = data.reservations || [];
    total = data.total || 0;

    console.log('[ReservationsData] Fetched reservations:', {
      count: reservations.length,
      total,
      filters: { status, checkin, checkout, search },
    });
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
    filter?: string;
    view?: string;
  };
}) {
  let status = searchParams?.status;
  let checkin = searchParams?.checkin;
  let checkout = searchParams?.checkout;
  let search = searchParams?.search;
  const filter = searchParams?.filter;
  const view = searchParams?.view;

  // ⚠️ 중요: searchParams 감지하여 자동 필터 적용 (딥 링크)
  if (filter === 'd1-unassigned') {
    // 내일 날짜 계산
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateToISO(tomorrow);

    if (tomorrowStr) {
      // 즉시 필터 적용
      checkin = tomorrowStr;
      // 미배정 필터는 클라이언트 컴포넌트에서 처리
      status = 'all'; // 상태 필터는 모두 표시하되, 미배정만 필터링
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">예약 / 배정</h1>
        <p className="text-sm text-muted-foreground font-medium">관리자 예약 현황 및 객실 배정 시스템</p>
      </div>

      <ReservationFiltersClient
        initialFilter={filter}
        initialView={view}
        initialCheckin={checkin}
      />

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
