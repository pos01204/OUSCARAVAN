'use client';

import { useState, useMemo } from 'react';
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
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  
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
    
    // 미배정 필터 (URL 파라미터로 확인)
    // 빠른 필터 "미배정만"은 리스트 뷰에서만 작동
    // 실제 구현은 URL 파라미터나 별도 상태로 관리 가능
    
    console.log('[ReservationsViewClient] Filtered reservations:', {
      view,
      total: reservations.length,
      filtered: filtered.length,
      filters: { status, checkin, checkout, search },
    });
    
    return filtered;
  }, [reservations, view, status, checkin, checkout, search]);

  return (
    <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')} className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TabsList>
            <TabsTrigger value="calendar">
              <Calendar className="mr-2 h-4 w-4" />
              캘린더
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" />
              리스트
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
