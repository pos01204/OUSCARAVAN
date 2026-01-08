'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, List } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="calendar" className="flex-1 md:flex-initial min-h-[44px]">
              <Calendar className="mr-2 h-4 w-4 md:h-4 md:w-4" />
              <span className="text-sm md:text-sm font-medium">캘린더</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex-1 md:flex-initial min-h-[44px]">
              <List className="mr-2 h-4 w-4 md:h-4 md:w-4" />
              <span className="text-sm md:text-sm font-medium">리스트</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="calendar" className="mt-0">
        <ReservationCalendarView reservations={reservations} />
      </TabsContent>

      <TabsContent value="list" className="mt-0">
        <ReservationListView
          reservations={filteredReservations}
          total={filteredReservations.length}
          search={search}
          status={status}
          checkin={checkin}
          checkout={checkout}
        />
      </TabsContent>
    </Tabs>
  );
}
