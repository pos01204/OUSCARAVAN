'use client';

import { useEffect, useMemo, useState } from 'react';
import { getReservations } from '@/lib/api';
import { logError } from '@/lib/logger';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { CriticalStatusBanner } from '@/components/admin/CriticalStatusBanner';
import { NotificationFeed } from '@/components/admin/NotificationFeed';
import { formatDateToISO } from '@/lib/utils/date';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [unassignedCount, setUnassignedCount] = useState(0);

  const tomorrowStr = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateToISO(tomorrow);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        if (!tomorrowStr) return;
        const data = await getReservations({
          checkin: tomorrowStr,
          limit: 1000,
        });
        const count = (data.reservations || []).filter(r => !r.assignedRoom).length;
        if (!cancelled) setUnassignedCount(count);
      } catch (error) {
        logError('Failed to fetch D-1 unassigned reservations (client)', error, {
          component: 'AdminDashboard',
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [tomorrowStr]);

  return (
    <div className="space-y-4 md:space-y-6 pb-0 -mb-4 md:mb-0">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-0.5 md:gap-1">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">홈</h1>
      </div>

      {/* 상단 배너 (Critical Status) */}
      {isLoading ? (
        <Card className="border-orange-200 bg-orange-50">
          <div className="p-4">
            <Skeleton className="h-5 w-64" />
          </div>
        </Card>
      ) : (
        <CriticalStatusBanner unassignedCount={unassignedCount} />
      )}

      {/* 실시간 피드 리스트 (SSE 연동) */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">실시간 알림</h2>
        <NotificationFeed />
      </div>
    </div>
  );
}
