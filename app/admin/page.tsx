'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdminOrders, getReservations } from '@/lib/api';
import { logError } from '@/lib/logger';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { CriticalStatusBanner } from '@/components/admin/CriticalStatusBanner';
import { NotificationFeed } from '@/components/admin/NotificationFeed';
import { formatDateToISO } from '@/lib/utils/date';
import { AdminKpiCards } from '@/components/admin/AdminKpiCards';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [todayCheckins, setTodayCheckins] = useState(0);
  const [todayCheckouts, setTodayCheckouts] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const todayStr = useMemo(() => {
    return formatDateToISO(new Date());
  }, []);

  const tomorrowStr = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateToISO(tomorrow);
  }, []);

  const loadKpis = useCallback(async () => {
    setIsLoading(true);
    setKpiError(null);
    try {
      if (!tomorrowStr || !todayStr) return;

      const [tomorrow, todayCheckin, todayCheckout, orders] = await Promise.all([
        getReservations({ checkin: tomorrowStr, limit: 1000 }),
        getReservations({ checkin: todayStr, limit: 1000 }),
        getReservations({ checkout: todayStr, limit: 1000 }),
        getAdminOrders({ date: todayStr, limit: 1000 }),
      ]);

      const d1Unassigned = (tomorrow.reservations || []).filter(
        (r) => r.status !== 'cancelled' && !r.assignedRoom
      ).length;

      const checkins = (todayCheckin.reservations || []).filter((r) => r.status !== 'cancelled').length;
      const checkouts = (todayCheckout.reservations || []).filter((r) => r.status !== 'cancelled').length;
      const pending = (orders.orders || []).filter((o) => o.status !== 'completed').length;

      setUnassignedCount(d1Unassigned);
      setTodayCheckins(checkins);
      setTodayCheckouts(checkouts);
      setPendingOrders(pending);
      setLastUpdatedAt(new Date());
    } catch (error) {
      logError('Failed to fetch admin KPI (client)', error, { component: 'AdminDashboard' });
      setKpiError(error instanceof Error ? error.message : '요약 정보를 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, [tomorrowStr, todayStr]);

  useEffect(() => {
    let cancelled = false;
    loadKpis().catch((error) => {
      if (cancelled) return;
      logError('Failed to fetch admin KPI (client)', error, { component: 'AdminDashboard' });
    });
    return () => {
      cancelled = true;
    };
  }, [loadKpis]);

  return (
    <div className="space-y-4 md:space-y-6 pb-0 -mb-4 md:mb-0">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-0.5 md:gap-1">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">홈</h1>
      </div>

      {/* KPI 요약 카드 */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <AdminKpiCards
          loading={isLoading}
          error={kpiError}
          lastUpdatedAt={lastUpdatedAt}
          todayCheckins={todayCheckins}
          todayCheckouts={todayCheckouts}
          d1Unassigned={unassignedCount}
          pendingOrders={pendingOrders}
          onRetry={loadKpis}
          onGoToTodayCheckins={() => {
            router.push(`/admin/reservations?view=list&checkin=${todayStr}`);
          }}
          onGoToTodayCheckouts={() => {
            router.push(`/admin/reservations?view=list&checkout=${todayStr}`);
          }}
          onGoToD1Unassigned={() => {
            router.push('/admin/reservations?view=list&filter=d1-unassigned');
          }}
          onGoToPendingOrders={() => {
            router.push(`/admin/orders?status=pending&date=${todayStr}`);
          }}
        />
      </div>

      {/* 상단 배너 (Critical Status) */}
      {isLoading ? (
        <Card variant="alert">
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
