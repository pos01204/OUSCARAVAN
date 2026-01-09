import { Suspense } from 'react';
import { getReservationsServer } from '@/lib/admin-api-server';
import { logError } from '@/lib/logger';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { CriticalStatusBanner } from '@/components/admin/CriticalStatusBanner';
import { NotificationFeed } from '@/components/admin/NotificationFeed';
import { formatDateToISO } from '@/lib/utils/date';

// D-1 미배정 예약 배너 컴포넌트
async function CriticalBanner() {
  let unassignedCount = 0;

  try {
    // 내일 날짜 계산
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateToISO(tomorrow);

    if (tomorrowStr) {
      // 내일 체크인 예정이고 미배정인 예약 조회
      const data = await getReservationsServer({
        checkin: tomorrowStr,
        limit: 1000, // 충분히 큰 값
      });

      // 미배정 예약만 필터링
      unassignedCount = (data.reservations || []).filter(
        (r) => !r.assignedRoom
      ).length;
    }
  } catch (error) {
    logError('Failed to fetch D-1 unassigned reservations', error, {
      component: 'CriticalBanner',
    });
  }

  return <CriticalStatusBanner unassignedCount={unassignedCount} />;
}

export default async function AdminDashboard() {

  return (
    <div className="space-y-4 md:space-y-6 pb-0 -mb-4 md:mb-0">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-0.5 md:gap-1">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">홈</h1>
      </div>

      {/* 상단 배너 (Critical Status) */}
      <Suspense fallback={
        <Card className="border-orange-200 bg-orange-50">
          <div className="p-4">
            <Skeleton className="h-5 w-64" />
          </div>
        </Card>
      }>
        <CriticalBanner />
      </Suspense>

      {/* 실시간 피드 리스트 (SSE 연동) */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">실시간 알림</h2>
        <NotificationFeed />
      </div>
    </div>
  );
}
