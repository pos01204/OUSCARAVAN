'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View, Event, SlotInfo, Components } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { type Reservation } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { calculateTotalAmount } from '@/lib/utils/reservation';
import { useSwipe } from '@/lib/hooks/useSwipe';
import { ReservationModalCard } from '@/components/admin/ReservationModalCard';
import { Calendar as CalendarIcon, List } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// 상태별 색상 시스템 (강화)
const STATUS_COLORS: Record<Reservation['status'], { bg: string; text: string; label: string }> = {
  pending: { bg: '#6B7280', text: 'white', label: '대기' },
  assigned: { bg: '#2563EB', text: 'white', label: '배정' },
  checked_in: { bg: '#059669', text: 'white', label: '체크인' },
  checked_out: { bg: '#7C3AED', text: 'white', label: '체크아웃' },
  cancelled: { bg: '#DC2626', text: 'white', label: '취소' },
};

// 대기/미배정 그룹화 임계값 (3개 이상이면 그룹화)
const PENDING_GROUP_THRESHOLD = 3;

// 한국어 로케일 설정
const locales = {
  'ko': ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ko }),
  getDay,
  locales,
});

interface ReservationEvent extends Event {
  id: string;
  resource: Reservation;
}

interface ReservationCalendarViewProps {
  reservations: Reservation[];
}

export function ReservationCalendarView({
  reservations,
}: ReservationCalendarViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [calendarViewType, setCalendarViewType] = useState<'grid' | 'timeline'>('grid');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 여부 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Phase 3: 스와이프 제스처로 모달 닫기
  const swipeHandlers = useSwipe({
    onSwipeDown: () => {
      // 모바일에서만 아래로 스와이프하여 모달 닫기
      if (isMobile) {
        setIsModalOpen(false);
      }
    },
  });

  // 날짜별 예약 그룹화 (하이브리드 방식용) - 먼저 계산
  const reservationsByDate = useMemo(() => {
    const grouped: Record<string, Reservation[]> = {};
    
    reservations.forEach((reservation) => {
      try {
        const checkin = new Date(reservation.checkin);
        const checkout = new Date(reservation.checkout);
        
        if (isNaN(checkin.getTime()) || isNaN(checkout.getTime())) {
          console.warn('[Calendar] Skipping reservation with invalid dates:', {
            id: reservation.id,
            checkin: reservation.checkin,
            checkout: reservation.checkout,
          });
          return;
        }
        
        // 체크인부터 체크아웃까지 모든 날짜에 예약 추가
        const currentDate = new Date(checkin);
        currentDate.setHours(0, 0, 0, 0);
        const endDate = new Date(checkout);
        endDate.setHours(0, 0, 0, 0);
        
        // 날짜 범위가 유효한지 확인
        if (currentDate > endDate) {
          console.warn('[Calendar] Checkin after checkout, skipping:', {
            id: reservation.id,
            checkin: reservation.checkin,
            checkout: reservation.checkout,
          });
          return;
        }
        
        while (currentDate <= endDate) {
          const dateKey = format(currentDate, 'yyyy-MM-dd');
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          // 중복 방지
          if (!grouped[dateKey].find(r => r.id === reservation.id)) {
            grouped[dateKey].push(reservation);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } catch (error) {
        console.error('[Calendar] Error grouping reservation:', {
          reservationId: reservation.id,
          checkin: reservation.checkin,
          checkout: reservation.checkout,
          error,
        });
      }
    });
    
    // 그룹화 결과 로깅
    const dateKeys = Object.keys(grouped);
    const maxReservations = Math.max(...Object.values(grouped).map(arr => arr.length), 0);
    console.log('[Calendar] Reservations grouped by date:', {
      totalDates: dateKeys.length,
      maxReservationsPerDate: maxReservations,
      sampleDates: dateKeys.slice(0, 5).map(key => ({
        date: key,
        count: grouped[key].length,
      })),
    });
    
    return grouped;
  }, [reservations]);

  // 예약 데이터를 캘린더 이벤트로 변환 (하이브리드 방식 적용)
  const events: ReservationEvent[] = useMemo(() => {
    console.log('[Calendar] Processing reservations:', {
      total: reservations.length,
      sample: reservations.slice(0, 3).map(r => ({
        id: r.id,
        guestName: r.guestName,
        checkin: r.checkin,
        checkout: r.checkout,
        status: r.status,
        assignedRoom: r.assignedRoom,
      })),
    });
    
    const validReservations = reservations.filter((reservation) => {
      try {
        // 체크인/체크아웃 날짜가 유효한지 확인
        const checkin = new Date(reservation.checkin);
        const checkout = new Date(reservation.checkout);
        const isValid = !isNaN(checkin.getTime()) && !isNaN(checkout.getTime());
        
        if (!isValid) {
          console.warn('[Calendar] Invalid date reservation:', {
            id: reservation.id,
            reservationNumber: reservation.reservationNumber,
            checkin: reservation.checkin,
            checkout: reservation.checkout,
          });
        }
        
        return isValid;
      } catch (error) {
        console.error('[Calendar] Error validating reservation:', {
          id: reservation.id,
          error,
        });
        return false;
      }
    });
    
    console.log('[Calendar] Valid reservations:', {
      valid: validReservations.length,
      invalid: reservations.length - validReservations.length,
    });
    
    // ⚠️ 간소화: 날짜별로 체크인 건수만 표시 (배지 하나만)
    const eventMap = new Map<string, ReservationEvent>();
    const processedDates = new Set<string>();
    
    // 모든 날짜를 한 번만 순회하여 이벤트 생성
    Object.keys(reservationsByDate).forEach((dateKey) => {
      if (processedDates.has(dateKey)) return;
      processedDates.add(dateKey);
      
      const dateReservations = reservationsByDate[dateKey] || [];
      if (dateReservations.length === 0) return;
      
      const currentDate = new Date(dateKey + 'T00:00:00');
      if (isNaN(currentDate.getTime())) return;
      
      // 체크인 건수만 계산
      const checkinReservations = dateReservations.filter(r => {
        const rCheckin = new Date(r.checkin);
        return isSameDay(rCheckin, currentDate);
      });
      const checkinCount = checkinReservations.length;
      
      // 체크인 건수가 0보다 큰 경우에만 이벤트 생성
      if (checkinCount > 0) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        eventMap.set(dateKey, {
          id: `checkin-${dateKey}`,
          title: `${checkinCount}건`, // 간소화: "체크인: N건" → "N건"
          start: dayStart,
          end: dayEnd,
          resource: checkinReservations[0],
        });
      }
    });
    
    const events = Array.from(eventMap.values());
    
    // 타입 가드 함수: 이벤트가 유효한 날짜를 가지고 있는지 확인
    const isValidEvent = (event: ReservationEvent | undefined): event is ReservationEvent & { start: Date; end: Date } => {
      return !!event && event.start instanceof Date && event.end instanceof Date;
    };
    
    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    
    // 타입 가드를 통과한 이벤트만 사용
    let dateRange: { earliest: string; latest: string } | null = null;
    if (isValidEvent(firstEvent) && isValidEvent(lastEvent)) {
      dateRange = {
        earliest: format(firstEvent.start, 'yyyy-MM-dd'),
        latest: format(lastEvent.end, 'yyyy-MM-dd'),
      };
    }
    
    // 이벤트 타입별 개수 계산
    const unassignedEvents = events.filter(e => {
      const title = typeof e.title === 'string' ? e.title : String(e.title || '');
      return title.includes('미배정');
    }).length;
    const checkinEvents = events.filter(e => {
      const title = typeof e.title === 'string' ? e.title : String(e.title || '');
      return title.includes('체크인');
    }).length;
    const checkoutEvents = events.filter(e => {
      const title = typeof e.title === 'string' ? e.title : String(e.title || '');
      return title.includes('체크아웃');
    }).length;
    
    console.log('[Calendar] Generated events:', {
      total: events.length,
      unassigned: unassignedEvents,
      checkin: checkinEvents,
      checkout: checkoutEvents,
      dateRange,
    });
    
    return events;
  }, [reservations, reservationsByDate]);


  // 이벤트 스타일 커스터마이징 (미배정/체크인/체크아웃 건수 표시)
  const eventStyleGetter = (event: ReservationEvent) => {
    const reservation = event.resource;
    const isGrouped = event.id.startsWith('group-');
    
    // 타입 안전성 보장
    if (!event.start || !(event.start instanceof Date)) {
      const colorConfig = STATUS_COLORS[reservation.status] || STATUS_COLORS.pending;
      return {
        style: {
          backgroundColor: colorConfig.bg,
          borderRadius: '4px',
          opacity: 0.95,
          color: colorConfig.text,
          border: '0px',
          display: 'block',
          fontSize: '0.7rem',
          fontWeight: '700',
          padding: '2px 6px',
          cursor: 'pointer',
          marginBottom: '2px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      };
    }
    
    // 간소화: 체크인 건수만 표시 (초록색 배지)
    const colorConfig = { bg: '#047857', text: 'white' }; // 체크인 색상 고정
    
    return {
      style: {
        backgroundColor: colorConfig.bg,
        borderRadius: '4px',
        opacity: 0.95,
        color: colorConfig.text,
        border: '0px',
        display: 'block',
        fontSize: '0.7rem',
        fontWeight: '700',
        padding: '2px 6px',
        cursor: 'pointer',
        marginBottom: '2px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'center' as const,
      },
    };
  };

  // 커스텀 이벤트 컴포넌트 (체크인 건수만 표시 - 간소화)
  const EventComponent = useCallback(({ event }: { event: ReservationEvent }) => {
    // title을 string으로 변환 (예: "3건")
    const titleString = typeof event.title === 'string' ? event.title : String(event.title || '');
    
    // 간소화: 체크인 건수만 표시 (초록색 배지)
    const colorConfig = { bg: '#047857', text: 'white' };
    
    return (
      <div
        className="rbc-event-mobile"
        style={{
          backgroundColor: colorConfig.bg,
          color: colorConfig.text,
          padding: '4px 6px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '700',
          textAlign: 'center',
          width: '100%',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          letterSpacing: '0.1px',
          lineHeight: '1.2',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={`체크인 ${titleString}`}
      >
        {titleString}
      </div>
    );
  }, []);

  // 커스텀 컴포넌트 설정
  const components: Components<ReservationEvent> = useMemo(() => ({
    event: EventComponent as any, // react-big-calendar 타입 호환성
  }), [EventComponent]);

  // 선택된 날짜의 예약 목록 가져오기
  const getReservationsForDate = useCallback((date: Date) => {
    // 날짜만 비교하기 위해 시간 부분 제거
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    targetDate.setHours(0, 0, 0, 0);
    
    const filtered = reservations.filter((reservation) => {
      try {
        // 체크인 날짜 (시간 제거)
        const checkin = new Date(reservation.checkin);
        const checkinDate = new Date(checkin.getFullYear(), checkin.getMonth(), checkin.getDate());
        checkinDate.setHours(0, 0, 0, 0);
        
        // 체크아웃 날짜 (시간 제거)
        const checkout = new Date(reservation.checkout);
        const checkoutDate = new Date(checkout.getFullYear(), checkout.getMonth(), checkout.getDate());
        checkoutDate.setHours(0, 0, 0, 0);
        
        // 날짜 범위 확인: 체크인 <= 선택일 <= 체크아웃
        const isInRange = checkinDate <= targetDate && targetDate <= checkoutDate;
        
        return isInRange;
      } catch (error) {
        console.error('[Calendar] Error filtering reservation for date:', {
          reservationId: reservation.id,
          checkin: reservation.checkin,
          checkout: reservation.checkout,
          error,
        });
        return false;
      }
    });
    
    console.log('[Calendar] Reservations for date:', {
      date: format(targetDate, 'yyyy-MM-dd'),
      count: filtered.length,
      reservations: filtered.map(r => ({
        id: r.id,
        guestName: r.guestName,
        checkin: r.checkin,
        checkout: r.checkout,
      })),
    });
    
    return filtered;
  }, [reservations]);

  // 날짜 클릭 핸들러 (모달로 해당 날짜의 예약 표시)
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    const clickedDate = slotInfo.start;
    setSelectedDate(clickedDate);
    setIsModalOpen(true);
  }, []);

  // 이벤트 클릭 핸들러 (하이브리드 방식)
  const handleSelectEvent = useCallback((event: ReservationEvent) => {
    // 타입 안전성 체크
    if (!event.start || !(event.start instanceof Date)) {
      console.warn('[Calendar] Event has invalid start date:', event);
      return;
    }
    
    // 체크인 건수 이벤트인 경우 (간소화된 버전) 또는 그룹화된 이벤트인 경우 해당 날짜의 모달 열기
    if (event.id.startsWith('checkin-') || event.id.startsWith('group-')) {
      const date = new Date(event.start);
      setSelectedDate(date);
      setIsModalOpen(true);
    } else {
      // 개별 이벤트인 경우 상세 페이지로 이동
      router.push(`/admin/reservations/${event.resource.id}`);
    }
  }, [router]);

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDate(null);
  }, []);

  // 예약 상세 페이지로 이동
  const handleViewDetail = useCallback((reservationId: string) => {
    router.push(`/admin/reservations/${reservationId}`);
    handleCloseModal();
  }, [router, handleCloseModal]);

  // 한국어 메시지
  const messages = {
    next: '다음',
    previous: '이전',
    today: '오늘',
    month: '월',
    week: '주',
    day: '일',
    agenda: '일정',
    date: '날짜',
    time: '시간',
    event: '예약',
    noEventsInRange: '이 기간에 예약이 없습니다.',
    showMore: (total: number) => `+${total}개 더 보기`,
  };

  // 선택된 날짜의 예약 목록 (중요도 순서로 정렬: 미배정 → 체크인 → 체크아웃)
  const selectedDateReservations = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateReservations = getReservationsForDate(selectedDate);
    
    // 중요도 순서로 정렬
    return [...dateReservations].sort((a, b) => {
      // 1순위: 미배정
      const aUnassigned = !a.assignedRoom;
      const bUnassigned = !b.assignedRoom;
      if (aUnassigned && !bUnassigned) return -1;
      if (!aUnassigned && bUnassigned) return 1;
      
      // 2순위: 체크인 날짜
      const aCheckin = new Date(a.checkin);
      const bCheckin = new Date(b.checkin);
      const aIsCheckinDay = isSameDay(aCheckin, selectedDate);
      const bIsCheckinDay = isSameDay(bCheckin, selectedDate);
      if (aIsCheckinDay && !bIsCheckinDay) return -1;
      if (!aIsCheckinDay && bIsCheckinDay) return 1;
      
      // 3순위: 체크아웃 날짜
      const aCheckout = new Date(a.checkout);
      const bCheckout = new Date(b.checkout);
      const aIsCheckoutDay = isSameDay(aCheckout, selectedDate);
      const bIsCheckoutDay = isSameDay(bCheckout, selectedDate);
      if (aIsCheckoutDay && !bIsCheckoutDay) return -1;
      if (!aIsCheckoutDay && bIsCheckoutDay) return 1;
      
      // 나머지는 이름순
      return a.guestName.localeCompare(b.guestName);
    });
  }, [selectedDate, getReservationsForDate]);

  // 예약 정렬 함수 (중요도 순서: 미배정 → 체크인 → 체크아웃)
  const sortReservationsByPriority = useCallback((reservations: Reservation[]) => {
    if (!selectedDate) return reservations;
    
    return [...reservations].sort((a, b) => {
      // 1순위: 미배정
      const aUnassigned = !a.assignedRoom;
      const bUnassigned = !b.assignedRoom;
      if (aUnassigned && !bUnassigned) return -1;
      if (!aUnassigned && bUnassigned) return 1;
      
      // 2순위: 체크인 날짜
      const aCheckin = new Date(a.checkin);
      const bCheckin = new Date(b.checkin);
      const aIsCheckinDay = isSameDay(aCheckin, selectedDate);
      const bIsCheckinDay = isSameDay(bCheckin, selectedDate);
      if (aIsCheckinDay && !bIsCheckinDay) return -1;
      if (!aIsCheckinDay && bIsCheckinDay) return 1;
      
      // 3순위: 체크아웃 날짜
      const aCheckout = new Date(a.checkout);
      const bCheckout = new Date(b.checkout);
      const aIsCheckoutDay = isSameDay(aCheckout, selectedDate);
      const bIsCheckoutDay = isSameDay(bCheckout, selectedDate);
      if (aIsCheckoutDay && !bIsCheckoutDay) return -1;
      if (!aIsCheckoutDay && bIsCheckoutDay) return 1;
      
      // 나머지는 이름순
      return a.guestName.localeCompare(b.guestName);
    });
  }, [selectedDate]);

  // 상태별 배지
  const getStatusBadge = useCallback((status: Reservation['status']) => {
    const variants: Record<Reservation['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: '대기', variant: 'outline' },
      assigned: { label: '배정 완료', variant: 'secondary' },
      checked_in: { label: '체크인', variant: 'default' },
      checked_out: { label: '체크아웃', variant: 'secondary' },
      cancelled: { label: '취소', variant: 'destructive' },
    };
    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  }, []);

  // 타임라인 뷰용 날짜별 예약 그룹화
  const timelineReservations = useMemo(() => {
    if (calendarViewType !== 'timeline') return [];
    
    // 현재 월의 모든 날짜 가져오기
    const start = startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    const end = endOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dayReservations = getReservationsForDate(day);
      return {
        date: day,
        reservations: dayReservations,
      };
    }).filter(day => day.reservations.length > 0);
  }, [calendarViewType, currentDate, getReservationsForDate]);

  return (
    <>
      {/* 뷰 타입 선택 버튼 */}
      <div className="flex items-center justify-end gap-2 mb-3">
        <Button
          variant={calendarViewType === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCalendarViewType('grid')}
          className="min-h-[36px]"
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          그리드
        </Button>
        <Button
          variant={calendarViewType === 'timeline' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCalendarViewType('timeline')}
          className="min-h-[36px]"
        >
          <List className="h-4 w-4 mr-2" />
          타임라인
        </Button>
      </div>

      {/* 그리드 뷰 */}
      {calendarViewType === 'grid' && (
        <div className="h-[calc(100vh-200px)] md:h-[700px] mt-4 rounded-lg border border-border bg-card overflow-hidden">
          <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', padding: '8px' }}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          components={components}
          messages={messages}
          culture="ko"
          selectable
          popup={false}
          formats={{
            dayFormat: 'd',
            dayHeaderFormat: (date, culture, localizer) => {
              return localizer?.format(date, 'EEE', culture) || '';
            },
            dayRangeHeaderFormat: ({ start, end }) =>
              `${format(start, 'M월 d일', { locale: ko })} - ${format(end, 'M월 d일', { locale: ko })}`,
            monthHeaderFormat: 'yyyy년 M월',
            weekdayFormat: (date, culture, localizer) => {
              return localizer?.format(date, 'EEE', culture) || '';
            },
          }}
          // 모바일에서는 월간 뷰만 허용, 데스크톱에서는 모든 뷰 허용
          views={isMobile ? ['month'] : ['month', 'week', 'day', 'agenda']}
          defaultView="month"
        />
        </div>
      )}

      {/* 타임라인 뷰 - 일자별 세로 리스트 */}
      {calendarViewType === 'timeline' && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prevMonth = new Date(currentDate);
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setCurrentDate(prevMonth);
                }}
                className="min-h-[36px]"
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="min-h-[36px]"
              >
                오늘
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextMonth = new Date(currentDate);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setCurrentDate(nextMonth);
                }}
                className="min-h-[36px]"
              >
                다음
              </Button>
            </div>
          </div>

          <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
            {timelineReservations.length > 0 ? (
              timelineReservations.map(({ date, reservations }) => (
                <Card key={format(date, 'yyyy-MM-dd')} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-primary">
                          {format(date, 'd', { locale: ko })}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reservations.length}건의 예약
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDate(date);
                          setIsModalOpen(true);
                        }}
                        className="min-h-[36px]"
                      >
                        상세 보기
                      </Button>
                    </div>

                    <div className="space-y-2 mt-3">
                      {[...reservations].sort((a, b) => {
                        // 1순위: 미배정
                        const aUnassigned = !a.assignedRoom;
                        const bUnassigned = !b.assignedRoom;
                        if (aUnassigned && !bUnassigned) return -1;
                        if (!aUnassigned && bUnassigned) return 1;
                        
                        // 2순위: 체크인 날짜
                        const aCheckin = new Date(a.checkin);
                        const bCheckin = new Date(b.checkin);
                        const aIsCheckinDay = isSameDay(aCheckin, date);
                        const bIsCheckinDay = isSameDay(bCheckin, date);
                        if (aIsCheckinDay && !bIsCheckinDay) return -1;
                        if (!aIsCheckinDay && bIsCheckinDay) return 1;
                        
                        // 3순위: 체크아웃 날짜
                        const aCheckout = new Date(a.checkout);
                        const bCheckout = new Date(b.checkout);
                        const aIsCheckoutDay = isSameDay(aCheckout, date);
                        const bIsCheckoutDay = isSameDay(bCheckout, date);
                        if (aIsCheckoutDay && !bIsCheckoutDay) return -1;
                        if (!aIsCheckoutDay && bIsCheckoutDay) return 1;
                        
                        // 나머지는 이름순
                        return a.guestName.localeCompare(b.guestName);
                      }).slice(0, 3).map((reservation) => (
                        <div
                          key={reservation.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                          onClick={() => handleViewDetail(reservation.id)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getStatusBadge(reservation.status)}
                            <span className="font-medium truncate">{reservation.guestName}</span>
                            {!reservation.assignedRoom && (
                              <Badge variant="outline" className="text-xs">미배정</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground ml-2">
                            {calculateTotalAmount(reservation).totalAmount.toLocaleString()}원
                          </div>
                        </div>
                      ))}
                      {reservations.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDate(date);
                            setIsModalOpen(true);
                          }}
                          className="w-full text-xs"
                        >
                          +{reservations.length - 3}건 더 보기
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                이 기간에는 예약이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 날짜별 예약 목록 모달 - Phase 1: 모바일 최적화, Phase 3: 스와이프 닫기 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="md:max-w-2xl h-[90vh] md:h-auto md:max-h-[80vh] p-0 md:p-6 flex flex-col !left-0 !top-0 !right-0 !bottom-0 md:!left-[50%] md:!top-[50%] md:!translate-x-[-50%] md:!translate-y-[-50%] md:!right-auto md:!bottom-auto !translate-x-0 !translate-y-0 md:rounded-lg rounded-none w-full md:w-auto max-w-full md:max-w-2xl"
          aria-labelledby="reservation-modal-title"
          aria-describedby="reservation-modal-description"
          {...swipeHandlers}
        >
          {/* 모바일: 전체 화면, 데스크톱: 중앙 모달 */}
          <div className="flex flex-col h-full md:h-auto min-h-0">
            {/* 고정 헤더 */}
            <DialogHeader className="px-4 py-3 md:px-0 md:py-0 border-b md:border-0 flex-shrink-0 bg-background">
              <DialogTitle id="reservation-modal-title" className="text-lg md:text-xl font-semibold">
                {selectedDate && format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })} 예약 목록
              </DialogTitle>
              <DialogDescription id="reservation-modal-description" className="mt-1 md:mt-2 text-sm">
                {selectedDateReservations.length > 0 
                  ? `총 ${selectedDateReservations.length}건의 예약이 있습니다.`
                  : '이 날짜에는 예약이 없습니다.'}
              </DialogDescription>
            </DialogHeader>
          
          {/* 스크롤 가능한 콘텐츠 - 모바일 스크롤 개선 */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 md:px-0 md:py-4 min-h-0 -webkit-overflow-scrolling-touch">
          {selectedDateReservations.length > 0 ? (
            <div className="space-y-3">
              {/* 상태별 탭 분리 */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-auto p-1 gap-1">
                  <TabsTrigger value="all" className="text-xs md:text-sm min-h-[36px] px-1 md:px-3">
                    전체 ({selectedDateReservations.length})
                  </TabsTrigger>
                  <TabsTrigger value="assigned" className="text-xs md:text-sm min-h-[36px] px-1 md:px-3">
                    배정 ({selectedDateReservations.filter(r => r.status === 'assigned').length})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs md:text-sm min-h-[36px] px-1 md:px-3">
                    대기 ({selectedDateReservations.filter(r => r.status === 'pending').length})
                  </TabsTrigger>
                  <TabsTrigger value="checked_in" className="text-xs md:text-sm min-h-[36px] px-1 md:px-3">
                    체크인 ({selectedDateReservations.filter(r => r.status === 'checked_in').length})
                  </TabsTrigger>
                  <TabsTrigger value="checked_out" className="text-xs md:text-sm min-h-[36px] px-1 md:px-3">
                    체크아웃 ({selectedDateReservations.filter(r => r.status === 'checked_out').length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4 space-y-3">
                  {selectedDateReservations.map((reservation) => (
                    <ReservationModalCard
                      key={reservation.id}
                      reservation={reservation}
                      selectedDate={selectedDate}
                      onViewDetail={handleViewDetail}
                      onCloseModal={handleCloseModal}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="assigned" className="mt-4 space-y-3">
                  {sortReservationsByPriority(
                    selectedDateReservations.filter(r => r.status === 'assigned')
                  ).map((reservation) => (
                    <ReservationModalCard
                      key={reservation.id}
                      reservation={reservation}
                      selectedDate={selectedDate}
                      onViewDetail={handleViewDetail}
                      onCloseModal={handleCloseModal}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="pending" className="mt-4 space-y-3">
                  {sortReservationsByPriority(
                    selectedDateReservations.filter(r => r.status === 'pending')
                  ).map((reservation) => (
                    <ReservationModalCard
                      key={reservation.id}
                      reservation={reservation}
                      selectedDate={selectedDate}
                      onViewDetail={handleViewDetail}
                      onCloseModal={handleCloseModal}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="checked_in" className="mt-4 space-y-3">
                  {sortReservationsByPriority(
                    selectedDateReservations.filter(r => r.status === 'checked_in')
                  ).map((reservation) => (
                    <ReservationModalCard
                      key={reservation.id}
                      reservation={reservation}
                      selectedDate={selectedDate}
                      onViewDetail={handleViewDetail}
                      onCloseModal={handleCloseModal}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="checked_out" className="mt-4 space-y-3">
                  {sortReservationsByPriority(
                    selectedDateReservations.filter(r => r.status === 'checked_out')
                  ).map((reservation) => (
                    <ReservationModalCard
                      key={reservation.id}
                      reservation={reservation}
                      selectedDate={selectedDate}
                      onViewDetail={handleViewDetail}
                      onCloseModal={handleCloseModal}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              이 날짜에는 예약이 없습니다.
            </div>
          )}
          
          </div>
          
          {/* 모달 하단 버튼 - 고정 */}
          <div className="flex justify-end gap-2 px-4 py-3 md:px-0 md:py-0 border-t md:border-0 flex-shrink-0 bg-background">
            <Button 
              variant="outline" 
              onClick={handleCloseModal}
              className="min-h-[44px]"
              aria-label="예약 목록 모달 닫기"
            >
              닫기
            </Button>
            {selectedDate && (
              <Button 
                onClick={() => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  router.push(`/admin/reservations?checkin=${dateStr}`);
                  handleCloseModal();
                }}
                className="min-h-[44px]"
                aria-label={`${format(selectedDate, 'yyyy년 M월 d일', { locale: ko })} 체크인 예약 필터 적용`}
              >
                필터 적용
              </Button>
            )}
          </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
