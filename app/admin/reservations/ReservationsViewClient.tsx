'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, List, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button'; // This import is already present and correct for ReservationsViewClient
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ReservationCalendarView } from './ReservationCalendarView';
import { ReservationListView } from './ReservationListView';
import { type Reservation } from '@/lib/api';
import { isSameDay, format } from 'date-fns';

interface ReservationsViewClientProps {
  reservations: Reservation[];
  total?: number;
  search?: string;
  status?: string;
  checkin?: string;
  checkout?: string;
}

export function ReservationsViewClient({
  reservations,
  total,
  search,
  status,
  checkin,
  checkout,
}: ReservationsViewClientProps) {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');
  const viewParam = searchParams.get('view');

  const [calendarViewType, setCalendarViewType] = useState<'grid' | 'timeline'>('grid');

  // ⚠️ 중요: searchParams 감지하여 자동 뷰 전환 및 필터 적용
  const [view, setView] = useState<'list' | 'calendar'>(() => {
    // filter=d1-unassigned이거나 view=list인 경우 리스트 뷰로 시작
    if (filter === 'd1-unassigned' || viewParam === 'list') {
      return 'list';
    }
    return 'calendar';
  });

  // searchParams 변경 시 뷰 업데이트
  useEffect(() => {
    if (filter === 'd1-unassigned' || viewParam === 'list') {
      setView('list');
    } else if (viewParam === 'calendar') {
      setView('calendar');
    }
  }, [filter, viewParam]);

  // 리스트 뷰용 필터링된 예약 목록
  const filteredReservations = useMemo(() => {
    if (view === 'calendar') {
      // 캘린더 뷰는 모든 예약 표시
      return reservations;
    }

    // 리스트 뷰는 필터 적용
    let filtered = [...reservations];

    // 상태 필터
    if (status && status !== 'all') {
      filtered = filtered.filter(r => r.status === status);
    }

    // 체크인 날짜 필터
    if (checkin) {
      const checkinDate = new Date(checkin);
      filtered = filtered.filter(r => {
        const rCheckin = new Date(r.checkin);
        return isSameDay(rCheckin, checkinDate);
      });
    }

    // 체크아웃 날짜 필터
    if (checkout) {
      const checkoutDate = new Date(checkout);
      filtered = filtered.filter(r => {
        const rCheckout = new Date(r.checkout);
        return isSameDay(rCheckout, checkoutDate);
      });
    }

    // 검색 필터
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.guestName.toLowerCase().includes(searchLower) ||
        r.reservationNumber.toLowerCase().includes(searchLower)
      );
    }

    // ⚠️ 중요: 미배정 필터 (filter=d1-unassigned 또는 URL 파라미터)
    if (filter === 'd1-unassigned') {
      // 미배정 예약만 필터링
      filtered = filtered.filter(r => !r.assignedRoom);
    }

    console.log('[ReservationsViewClient] Filtered reservations:', {
      view,
      total: reservations.length,
      filtered: filtered.length,
      filters: { status, checkin, checkout, search, filter },
    });

    return filtered;
  }, [reservations, view, status, checkin, checkout, search, filter]);

  return (
    <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')} className="w-full">
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 md:px-0">
        {/* Tier 2 & 3: Unified View Control Layer (Structural & Display) */}
        <div className="flex items-center justify-between w-full">
          {/* Left: Primary View Toggle (Tier 2) */}
          <TabsList className="bg-muted/30 p-1 rounded-lg border border-border/40 h-auto">
            <TabsTrigger
              value="calendar"
              className="px-8 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all text-sm font-bold border-transparent data-[state=active]:border-border/10 border text-muted-foreground"
            >
              <Calendar className="mr-2 h-4 w-4" />
              캘린더
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="px-8 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all text-sm font-bold border-transparent data-[state=active]:border-border/10 border text-muted-foreground"
            >
              <List className="mr-2 h-4 w-4" />
              리스트
            </TabsTrigger>
          </TabsList>

          {/* Right: Secondary View Option (Tier 3) - Only visible in Calendar view */}
          {view === 'calendar' && (
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-bold text-muted-foreground tracking-tight">디스플레이</span>
              <div className="flex items-center bg-muted/20 p-1 rounded-md border border-border/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCalendarViewType('grid')}
                  className={`h-8 px-4 rounded-sm transition-all text-xs font-bold ${calendarViewType === 'grid'
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                    }`}
                >
                  <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                  그리드
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCalendarViewType('timeline')}
                  className={`h-8 px-4 rounded-sm transition-all text-xs font-bold ${calendarViewType === 'timeline'
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                    }`}
                >
                  <List className="h-3.5 w-3.5 mr-2" />
                  타임라인
                </Button>
              </div>
            </div>
          )}
        </div>

        <TabsContent value="calendar" className="mt-0 ring-offset-background focus-visible:outline-none">
          <ReservationCalendarView
            reservations={reservations}
            viewType={calendarViewType}
            onViewTypeChange={setCalendarViewType}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-0 ring-offset-background focus-visible:outline-none">
          <ReservationListView
            reservations={filteredReservations}
            total={filteredReservations.length}
            search={search}
            status={status}
            checkin={checkin}
            checkout={checkout}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
