'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { LastUpdatedAt } from '@/components/shared/LastUpdatedAt';
import { cn } from '@/lib/utils';

interface AdminKpiCardsProps {
  loading: boolean;
  error: string | null;
  lastUpdatedAt: Date | null;
  todayCheckins: number;
  todayCheckouts: number;
  d1Unassigned: number;
  pendingOrders: number;
  onRetry: () => void;
  onGoToTodayCheckins?: () => void;
  onGoToTodayCheckouts?: () => void;
  onGoToD1Unassigned?: () => void;
  onGoToPendingOrders?: () => void;
}

function KpiCard({
  title,
  value,
  hint,
  onClick,
  variant = 'info',
}: {
  title: string;
  value: number;
  hint: string;
  onClick?: () => void;
  variant?: 'default' | 'info' | 'cta' | 'alert' | 'muted';
}) {
  const clickable = Boolean(onClick);
  return (
    <Card
      variant={variant}
      className={cn(
        clickable && 'click-hint cursor-pointer'
      )}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      aria-label={clickable ? `${title} 상세 보기` : undefined}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black tracking-tight text-foreground">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function AdminKpiCards(props: AdminKpiCardsProps) {
  const {
    loading,
    error,
    lastUpdatedAt,
    todayCheckins,
    todayCheckouts,
    d1Unassigned,
    pendingOrders,
    onRetry,
    onGoToTodayCheckins,
    onGoToTodayCheckouts,
    onGoToD1Unassigned,
    onGoToPendingOrders,
  } = props;

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} variant="muted">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-12" />
                <Skeleton className="mt-2 h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="요약 정보를 불러오지 못했어요" description={error} onRetry={onRetry} />;
  }

  return (
    <div className="space-y-2">
      <LastUpdatedAt value={lastUpdatedAt} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          title="오늘 체크인"
          value={todayCheckins}
          hint="오늘 입실 예정"
          onClick={onGoToTodayCheckins}
          variant="info"
        />
        <KpiCard
          title="오늘 체크아웃"
          value={todayCheckouts}
          hint="오늘 퇴실 예정"
          onClick={onGoToTodayCheckouts}
          variant="info"
        />
        <KpiCard
          title="미배정"
          value={d1Unassigned}
          hint="내일 체크인 미배정"
          onClick={onGoToD1Unassigned}
          variant={d1Unassigned > 0 ? 'alert' : 'info'}
        />
        <KpiCard
          title="대기 주문"
          value={pendingOrders}
          hint="오늘 처리 대기"
          onClick={onGoToPendingOrders}
          variant={pendingOrders > 0 ? 'alert' : 'info'}
        />
      </div>
    </div>
  );
}

