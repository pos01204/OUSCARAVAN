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
import { RoomAssignmentDrawer } from '@/components/admin/RoomAssignmentDrawer';
import { Calendar as CalendarIcon, List, BedDouble } from 'lucide-react';
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
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Quick Assignment State
  const [assigningReservation, setAssigningReservation] = useState<Reservation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 모바일 여부 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // 모바일에서는 기본적으로 타임라인(리스트) 뷰 사용
      if (mobile) {
        setCalendarViewType('timeline');
      }

      const handleResize = () => {
        const mobile = window.innerWidth <= 768;
        setIsMobile(mobile);
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

    // 개별 예약 이벤트를 생성 (바 형태의 월간 뷰)
    const events = validReservations.map((reservation) => {
      const start = new Date(reservation.checkin);
      start.setHours(0, 0, 0, 0);
      const end = new Date(reservation.checkout);
      end.setHours(23, 59, 59, 999); // 당일 끝까지

      // 타이틀 포맷: "객실명 예약자"
      const roomName = reservation.assignedRoom || '미배정';
      const truncatedRoom = roomName.startsWith('A') || roomName.startsWith('B') ? roomName : roomName; // 레거시 필터링은 Drawer에서 했지만 표시는 그대로

      return {
        id: reservation.id,
        title: `${reservation.assignedRoom || '미배정'} ${reservation.guestName}`,
        start,
        end,
        resource: reservation,
        allDay: true, // 하루 종일 이벤트로 표시
      };
    });

    // const events = Array.from(eventMap.values()); // Removed

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


  // 이벤트 스타일 커스터마이징 (바 형태)
  const eventStyleGetter = (event: ReservationEvent) => {
    const reservation = event.resource;
    const colorConfig = STATUS_COLORS[reservation.status] || STATUS_COLORS.pending;

    return {
      style: {
        backgroundColor: colorConfig.bg,
        borderRadius: isMobile ? '3px' : '4px',
        opacity: 0.95, // 조금 더 선명하게
        color: 'white',
        border: '0.5px solid rgba(0,0,0,0.1)', // 미세한 테두리로 구분감 제공
        display: 'block',
        fontSize: isMobile ? '0.65rem' : '0.75rem', // 모바일에서 텍스트 잘림 방지
        lineHeight: isMobile ? '1.2' : '1.4',
        padding: isMobile ? '1px 2px' : '2px 6px',
        marginBottom: '1px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      },
    };
  };

  // 커스텀 이벤트 컴포넌트
  const EventComponent = useCallback(({ event }: { event: ReservationEvent }) => {
    return (
      <div
        title={event.title as string}
        className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold truncate leading-tight py-0.5`}
      >
        {event.title}
      </div>
    );
  }, [isMobile]);

  // 커스텀 "더 보기" 컴포넌트
  const ShowMoreComponent = useCallback(({ count }: { count: number }) => {
    return (
      <div className="text-[10px] md:text-xs text-primary font-bold hover:underline cursor-pointer py-0.5 px-1 bg-primary/5 rounded w-full text-center mt-1 border border-primary/20">
        +{count}건 더 보기
      </div>
    );
  }, []);

  // 커스텀 컴포넌트 설정
  const components: Components<ReservationEvent> = useMemo(() => ({
    event: EventComponent as any, // react-big-calendar 타입 호환성
    showMore: ShowMoreComponent as any,
  }), [EventComponent, ShowMoreComponent]);

  // 특정 날짜의 예약 목록 가져오기 (isFullList가 true면 해당 날짜에 머무는 모든 예약 반환)
  const getReservationsForDate = useCallback((date: Date, isFullList: boolean = false) => {
    const targetDate = startOfDay(date);

    return reservations.filter((reservation) => {
      try {
        const checkin = startOfDay(new Date(reservation.checkin));
        const checkout = startOfDay(new Date(reservation.checkout));

        if (isFullList) {
          // 해당 날짜에 머무는 모든 예약 (체크인 <= 날짜 <= 체크아웃)
          return targetDate >= checkin && targetDate <= checkout;
        } else {
          // 체크인 날짜인 경우만 (기본 보기)
          return checkin.getTime() === targetDate.getTime();
        }
      } catch (error) {
        return false;
      }
    });
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

  const handleQuickAssign = useCallback((reservation: Reservation) => {
    setAssigningReservation(reservation);
    setIsDrawerOpen(true);
  }, []);

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
      const dateKey = format(day, 'yyyy-MM-dd');
      const isExpanded = expandedDates.has(dateKey);

      // 확장 상태면 전체 목록, 아니면 체크인만 목록
      const dayReservations = getReservationsForDate(day, isExpanded);

      return {
        date: day,
        reservations: dayReservations,
        isExpanded,
      };
    }).filter(dayObj => dayObj.reservations.length > 0 || expandedDates.has(format(dayObj.date, 'yyyy-MM-dd')));
  }, [calendarViewType, currentDate, getReservationsForDate, expandedDates]);

  return (
    <>
      {/* 뷰 타입 선택 버튼 */}
      <div className="flex items-center justify-end gap-2 mb-3">
        <Button
          variant={calendarViewType === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCalendarViewType('grid')}
          className="min-h-[36px] flex-1 md:flex-none"
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          그리드
        </Button>
        <Button
          variant={calendarViewType === 'timeline' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCalendarViewType('timeline')}
          className="min-h-[36px] flex-1 md:flex-none"
        >
          <List className="h-4 w-4 mr-2" />
          타임라인
        </Button>
      </div>

      {/* 그리드 뷰 */}
      {calendarViewType === 'grid' && (
        <div className="h-[calc(100vh-200px)] md:h-[700px] mt-4 rounded-lg border border-border bg-card overflow-y-auto">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', minHeight: '600px', padding: '8px' }}
            view={view}
            onView={setView}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onShowMore={(events, date) => {
              // "+N개 더 보기" 클릭 시 타임라인 뷰로 전환하고 해당 날짜 확장
              setCalendarViewType('timeline');
              setCurrentDate(date);
              const dateKey = format(date, 'yyyy-MM-dd');
              const newExpanded = new Set(expandedDates);
              newExpanded.add(dateKey);
              setExpandedDates(newExpanded);
            }}
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
              timelineReservations.map(({ date, reservations, isExpanded }) => (
                <Card key={format(date, 'yyyy-MM-dd')} className={`border-l-4 transition-all ${isExpanded ? 'border-l-primary shadow-md' : 'border-l-muted'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isExpanded ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                          {format(date, 'd')}
                        </div>
                        <div>
                          <div className="font-bold text-sm">
                            {format(date, 'M.d (EEE)', { locale: ko })}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {isExpanded ? '전체 내역' : `${reservations.length}건의 체크인`}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={isExpanded ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => {
                          const dateKey = format(date, 'yyyy-MM-dd');
                          const newExpanded = new Set(expandedDates);
                          if (newExpanded.has(dateKey)) {
                            newExpanded.delete(dateKey);
                          } else {
                            newExpanded.add(dateKey);
                          }
                          setExpandedDates(newExpanded);
                        }}
                        className="h-8 text-xs px-3"
                      >
                        {isExpanded ? '접기' : '더 보기'}
                      </Button>
                    </div>

                    <div className="space-y-2 mt-3">
                      {(() => {
                        const sorted = [...reservations].sort((a, b) => {
                          const aUnassigned = !a.assignedRoom;
                          const bUnassigned = !b.assignedRoom;
                          if (aUnassigned && !bUnassigned) return -1;
                          if (!aUnassigned && bUnassigned) return 1;

                          const aCheckin = new Date(a.checkin);
                          const bCheckin = new Date(b.checkin);
                          const aIsCheckinDay = isSameDay(aCheckin, date);
                          const bIsCheckinDay = isSameDay(bCheckin, date);
                          if (aIsCheckinDay && !bIsCheckinDay) return -1;
                          if (!aIsCheckinDay && bIsCheckinDay) return 1;

                          const aCheckout = new Date(a.checkout);
                          const bCheckout = new Date(b.checkout);
                          const aIsCheckoutDay = isSameDay(aCheckout, date);
                          const bIsCheckoutDay = isSameDay(bCheckout, date);
                          if (aIsCheckoutDay && !bIsCheckoutDay) return -1;
                          if (!aIsCheckoutDay && bIsCheckoutDay) return 1;

                          return a.guestName.localeCompare(b.guestName);
                        });

                        const dateKey = format(date, 'yyyy-MM-dd');
                        const isExpanded = expandedDates.has(dateKey);
                        const displayReservations = isExpanded ? sorted : sorted.slice(0, 3);

                        return displayReservations.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer border border-transparent hover:border-primary/20"
                            onClick={() => handleViewDetail(reservation.id)}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                              <div className="shrink-0 scale-90 origin-left">
                                {getStatusBadge(reservation.status)}
                              </div>

                              <div className="font-bold text-sm shrink-0">
                                {reservation.guestName}
                              </div>

                              <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                                <span className="font-semibold text-primary/80">{reservation.roomType.split('(')[0]}</span>
                                <span className="text-[10px] opacity-60">
                                  • {calculateTotalAmount(reservation).totalAmount.toLocaleString()}원
                                </span>
                              </div>
                            </div>

                            <div className="ml-1 shrink-0">
                              {!reservation.assignedRoom ? (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-6 px-2 text-[10px] bg-primary hover:bg-primary/90 shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAssign(reservation);
                                  }}
                                >
                                  배정
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-[10px] py-0 h-5 px-1.5 text-primary border-primary/30">
                                  {reservation.assignedRoom}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                      {reservations.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const dateKey = format(date, 'yyyy-MM-dd');
                            const newExpanded = new Set(expandedDates);
                            if (newExpanded.has(dateKey)) {
                              newExpanded.delete(dateKey);
                            } else {
                              newExpanded.add(dateKey);
                            }
                            setExpandedDates(newExpanded);
                          }}
                          className="w-full text-xs text-primary font-medium hover:bg-primary/5 py-3 h-auto"
                        >
                          {expandedDates.has(format(date, 'yyyy-MM-dd'))
                            ? '접기'
                            : `+${reservations.length - 3}건 더 보기`}
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

      {/* 날짜별 예약 목록 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="md:max-w-2xl h-[90vh] md:h-auto md:max-h-[80vh] p-0 md:p-6 flex flex-col !left-0 !top-0 !right-0 !bottom-0 md:!left-[50%] md:!top-[50%] md:!translate-x-[-50%] md:!translate-y-[-50%] md:!right-auto md:!bottom-auto !translate-x-0 !translate-y-0 md:rounded-lg rounded-none w-full md:w-auto max-w-full md:max-w-2xl"
          aria-labelledby="reservation-modal-title"
          aria-describedby="reservation-modal-description"
          {...swipeHandlers}
        >
          <div className="flex flex-col h-full md:h-auto min-h-0">
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

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 md:px-0 md:py-4 min-h-0 -webkit-overflow-scrolling-touch">
              {selectedDateReservations.length > 0 ? (
                <div className="space-y-3">
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 h-auto p-1 gap-1">
                      <TabsTrigger value="all" className="text-base md:text-sm min-h-[36px] px-1 md:px-3">
                        전체
                      </TabsTrigger>
                      <TabsTrigger value="assigned" className="text-base md:text-sm min-h-[36px] px-1 md:px-3">
                        배정
                      </TabsTrigger>
                      <TabsTrigger value="pending" className="text-base md:text-sm min-h-[36px] px-1 md:px-3">
                        대기
                      </TabsTrigger>
                      <TabsTrigger value="checked_in" className="text-base md:text-sm min-h-[36px] px-1 md:px-3">
                        체크인
                      </TabsTrigger>
                      <TabsTrigger value="checked_out" className="text-base md:text-sm min-h-[36px] px-1 md:px-3">
                        체크아웃
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-4 space-y-3">
                      {selectedDateReservations.map((reservation) => (
                        <ReservationModalCard
                          key={reservation.id}
                          reservation={reservation}
                          selectedDate={selectedDate}
                          onViewDetail={() => handleViewDetail(reservation.id)}
                          onCloseModal={handleCloseModal}
                        />
                      ))}
                    </TabsContent>

                    {['assigned', 'pending', 'checked_in', 'checked_out'].map((status) => (
                      <TabsContent key={status} value={status} className="mt-4 space-y-3">
                        {sortReservationsByPriority(selectedDateReservations)
                          .filter(r => r.status === status)
                          .map((reservation) => (
                            <ReservationModalCard
                              key={reservation.id}
                              reservation={reservation}
                              selectedDate={selectedDate}
                              onViewDetail={() => handleViewDetail(reservation.id)}
                              onCloseModal={handleCloseModal}
                            />
                          ))}
                        {selectedDateReservations.filter(r => r.status === status).length === 0 && (
                          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                            해당 상태의 예약이 없습니다.
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <BedDouble className="h-12 w-12 mb-4 opacity-20" />
                  <p>이 날짜에는 예약이 없습니다.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t md:hidden bg-background">
              <Button variant="outline" className="w-full h-12" onClick={handleCloseModal}>
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RoomAssignmentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        reservation={assigningReservation}
        onAssignSuccess={() => router.refresh()}
      />
    </>
  );
}
