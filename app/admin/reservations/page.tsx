'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getReservations, type Reservation } from '@/lib/api';
import { logError } from '@/lib/logger';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ReservationFiltersClient } from './ReservationFiltersClient';
import { ReservationsViewClient } from './ReservationsViewClient';
import { formatDateToISO } from '@/lib/utils/date';
import { LastUpdatedAt } from '@/components/shared/LastUpdatedAt';
import { ErrorState } from '@/components/shared/ErrorState';
import { Loader2, RefreshCw } from 'lucide-react';

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

function ReservationsPageContent({
  refreshNonce,
  onRefreshed,
}: {
  refreshNonce: number;
  onRefreshed?: () => void;
}) {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || undefined;
  const view = searchParams.get('view') || undefined;
  const statusParam = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;
  const checkinParam = searchParams.get('checkin') || undefined;
  const checkout = searchParams.get('checkout') || undefined;

  const effectiveCheckin = useMemo(() => {
    if (filter !== 'd1-unassigned') return checkinParam;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateToISO(tomorrow) || checkinParam;
  }, [filter, checkinParam]);

  const effectiveStatus = useMemo(() => {
    // d1-unassigned는 상태 전체를 대상으로 필터링하므로 all 유지
    return filter === 'd1-unassigned' ? 'all' : statusParam;
  }, [filter, statusParam]);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        const data = await getReservations({
          status: effectiveStatus && effectiveStatus !== 'all' ? effectiveStatus : undefined,
          // 캘린더는 전체를 보기 위해 limit 크게
          search: search || undefined,
          limit: 1000,
        });
        if (!cancelled) {
          setReservations(data.reservations || []);
          setTotal(data.total || 0);
          setLastUpdatedAt(new Date());
          setLoadError(null);
        }
      } catch (error) {
        logError('Failed to fetch reservations (client)', error, {
          component: 'ReservationsPage',
          filters: { effectiveStatus, effectiveCheckin, checkout, search },
        });
        if (!cancelled) {
          setLoadError('예약 목록을 불러오지 못했어요. 다시 시도해주세요.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          onRefreshed?.();
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [effectiveStatus, effectiveCheckin, checkout, search, refreshNonce, retryNonce, onRefreshed]);

  // 초기 로딩(첫 성공 전)만 스켈레톤으로 화면 전환
  if (isLoading && !lastUpdatedAt) return <ReservationsSkeleton />;

  if (loadError && !lastUpdatedAt) {
    return (
      <ErrorState
        title="예약 목록을 불러오지 못했어요"
        description={loadError}
        onRetry={() => setRetryNonce((n) => n + 1)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <LastUpdatedAt value={lastUpdatedAt} />
          {isLoading && lastUpdatedAt ? (
            <p className="mt-1 text-xs text-muted-foreground">갱신 중...</p>
          ) : null}
        </div>
      </div>
      {loadError && lastUpdatedAt ? (
        <ErrorState
          title="예약 목록을 불러오지 못했어요"
          description={loadError}
          onRetry={() => setRetryNonce((n) => n + 1)}
        />
      ) : null}
      <ReservationsViewClient
        reservations={reservations}
        total={total}
        search={search || undefined}
        status={effectiveStatus}
        checkin={effectiveCheckin}
        checkout={checkout}
      />
    </div>
  );
}

export default function ReservationsPage() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || undefined;
  const view = searchParams.get('view') || undefined;
  const checkinParam = searchParams.get('checkin') || undefined;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const effectiveCheckin = useMemo(() => {
    if (filter !== 'd1-unassigned') return checkinParam;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateToISO(tomorrow) || checkinParam;
  }, [filter, checkinParam]);

  return (
    <div className="space-y-4 md:space-y-6 pb-0 -mb-4 md:mb-0">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5 md:gap-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">예약 / 배정</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">관리자 예약 현황 및 객실 배정 시스템</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs font-semibold md:h-9 md:px-3 md:text-sm rounded-full"
            onClick={() => {
              setIsRefreshing(true);
              setRefreshNonce((n) => n + 1);
            }}
            aria-label="예약 목록 새로고침"
            title="새로고침"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline sm:ml-2">새로고침</span>
          </Button>
        </div>
      </div>

      <ReservationFiltersClient
        initialFilter={filter}
        initialView={view}
        initialCheckin={effectiveCheckin}
      />

      <Suspense fallback={<ReservationsSkeleton />}>
        <ReservationsPageContent
          refreshNonce={refreshNonce}
          onRefreshed={() => setIsRefreshing(false)}
        />
      </Suspense>
    </div>
  );
}
