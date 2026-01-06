import { Suspense } from 'react';
import { getAdminStatsServer, getReservationsServer } from '@/lib/admin-api-server';
import { type Reservation, type AdminStats } from '@/lib/api';
import { logError } from '@/lib/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

// 통계 컴포넌트
async function StatsCards() {
  let stats: AdminStats = {
    todayReservations: 0,
    pendingCheckins: 0,
    pendingCheckouts: 0,
    pendingOrders: 0,
  };
  
  try {
    stats = await getAdminStatsServer();
  } catch (error) {
    logError('Failed to fetch admin stats', error, {
      component: 'StatsCards',
    });
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            오늘 예약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayReservations}</div>
          <p className="text-xs text-muted-foreground">
            오늘 예정된 예약
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            체크인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingCheckins}</div>
          <p className="text-xs text-muted-foreground">
            오늘 체크인 예정
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            체크아웃
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingCheckouts}</div>
          <p className="text-xs text-muted-foreground">
            오늘 체크아웃 예정
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            주문
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          <p className="text-xs text-muted-foreground">
            처리 대기 중인 주문
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// 최근 예약 목록 컴포넌트
async function RecentReservations() {
  let reservations: Reservation[] = [];
  
  try {
    const data = await getReservationsServer({ limit: 5 });
    reservations = data.reservations || [];
  } catch (error) {
    logError('Failed to fetch recent reservations', error, {
      component: 'RecentReservations',
    });
  }
  
  const getStatusBadge = (status: Reservation['status']) => {
    const variants: Record<Reservation['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: '대기', variant: 'outline' },
      assigned: { label: '배정 완료', variant: 'secondary' },
      checked_in: { label: '체크인', variant: 'default' },
      checked_out: { label: '체크아웃', variant: 'secondary' },
      cancelled: { label: '취소', variant: 'destructive' },
    };
    return variants[status] || { label: status, variant: 'outline' };
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>최근 예약</CardTitle>
            <CardDescription>
              최근 등록된 예약 목록 (최대 5개)
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/reservations">전체 보기</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            예약이 없습니다.
          </p>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const statusBadge = getStatusBadge(reservation.status);
              return (
                <Link
                  key={reservation.id}
                  href={`/admin/reservations/${reservation.id}`}
                  className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{reservation.guestName}</p>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {reservation.reservationNumber} · {reservation.assignedRoom || '방 미배정'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {reservation.checkin} ~ {reservation.checkout}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboard() {
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">
          오우스카라반 예약 관리 시스템
        </p>
      </div>
      
      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <StatsCards />
      </Suspense>
      
      <Suspense fallback={
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      }>
        <RecentReservations />
      </Suspense>
    </div>
  );
}
