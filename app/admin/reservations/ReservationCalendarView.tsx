'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View, Event, SlotInfo, Components } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { type Reservation } from '@/lib/api';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/shared/StatusPill';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { calculateTotalAmount } from '@/lib/utils/reservation';
import { getReservationStatusMeta } from '@/lib/utils/status-meta';
import { useSwipe } from '@/lib/hooks/useSwipe';
import { ReservationModalCard } from '@/components/admin/ReservationModalCard';
import { RoomAssignmentDrawer } from '@/components/admin/RoomAssignmentDrawer';
import { Calendar as CalendarIcon, List, BedDouble } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const IS_DEV = process.env.NODE_ENV !== 'production';
const debugLog = (...args: unknown[]) => {
  if (IS_DEV) console.log(...args);
};
const debugWarn = (...args: unknown[]) => {
  if (IS_DEV) console.warn(...args);
};

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
  viewType: 'grid' | 'timeline';
  onViewTypeChange: (type: 'grid' | 'timeline') => void;
}

export function ReservationCalendarView({
  reservations,
  viewType,
  onViewTypeChange: setCalendarViewType,
}: ReservationCalendarViewProps) {
  const calendarViewType = viewType;
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [onlyUnassignedInInspector, setOnlyUnassignedInInspector] = useState(false);
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
  }, [setCalendarViewType]);

  // 인스펙터 날짜가 바뀌면 "미배정만" 토글은 기본 해제
  useEffect(() => {
    setOnlyUnassignedInInspector(false);
  }, [selectedDate]);

  // 인스펙터 닫기 (모든 닫힘 경로에서 동일하게 사용)
  const handleCloseInspector = useCallback(() => {
    setIsInspectorOpen(false);
    setSelectedDate(null);
  }, []);

  // Phase 3: 스와이프 제스처로 모달 닫기
  const swipeHandlers = useSwipe({
    onSwipeDown: () => {
      // 모바일에서만 아래로 스와이프하여 모달 닫기
      if (isMobile) {
        handleCloseInspector();
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
          debugWarn('[Calendar] Skipping reservation with invalid dates:', {
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
          debugWarn('[Calendar] Checkin after checkout, skipping:', {
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
    debugLog('[Calendar] Reservations grouped by date:', {
      totalDates: dateKeys.length,
      maxReservationsPerDate: maxReservations,
      sampleDates: dateKeys.slice(0, 5).map(key => ({
        date: key,
        count: grouped[key].length,
      })),
    });

    return grouped;
  }, [reservations]);

  const getWorkPrefix = useCallback((reservation: Reservation) => {
    if (!reservation.assignedRoom) return '미';
    if (reservation.status === 'checked_in') return '입';
    if (reservation.status === 'checked_out') return '퇴';
    if (reservation.status === 'assigned') return '배';
    if (reservation.status === 'pending') return '대';
    if (reservation.status === 'cancelled') return '취';
    return '예약';
  }, []);

  const getEventShortTitle = useCallback(
    (reservation: Reservation) => {
      const prefix = getWorkPrefix(reservation);
      return `${prefix} ${reservation.guestName}`;
    },
    [getWorkPrefix]
  );

  // 예약 데이터를 캘린더 이벤트로 변환 (하이브리드 방식 적용)
  const events: ReservationEvent[] = useMemo(() => {
    const validReservations = reservations.filter((reservation) => {
      try {
        // 체크인/체크아웃 날짜가 유효한지 확인
        const checkin = new Date(reservation.checkin);
        const checkout = new Date(reservation.checkout);
        const isValid = !isNaN(checkin.getTime()) && !isNaN(checkout.getTime());

        if (!isValid) {
          debugWarn('[Calendar] Invalid date reservation:', {
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

    // 개별 예약 이벤트를 생성 (바 형태의 월간 뷰)
    const events = validReservations.map((reservation) => {
      const start = new Date(reservation.checkin);
      start.setHours(0, 0, 0, 0);
      const end = new Date(reservation.checkout);
      end.setHours(23, 59, 59, 999); // 당일 끝까지

      return {
        id: reservation.id,
        // 월간 셀 이벤트 제목: 업무형 축약 표기(미/입/퇴 + 이름)
        title: getEventShortTitle(reservation),
        start,
        end,
        resource: reservation,
        allDay: true, // 하루 종일 이벤트로 표시
      };
    });

    // 월간 셀에서 “미배정”이 먼저 보이도록 동일 start 기준 우선순위 정렬
    events.sort((a, b) => {
      const aStart = a.start instanceof Date ? a.start.getTime() : 0;
      const bStart = b.start instanceof Date ? b.start.getTime() : 0;
      if (aStart !== bStart) return aStart - bStart;
      const aUnassigned = !a.resource.assignedRoom;
      const bUnassigned = !b.resource.assignedRoom;
      if (aUnassigned && !bUnassigned) return -1;
      if (!aUnassigned && bUnassigned) return 1;
      return a.resource.guestName.localeCompare(b.resource.guestName);
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

    return events;
  }, [getEventShortTitle, reservations]);


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
    const r = event.resource;
    const fullTitle = `${r.assignedRoom || '미배정'} · ${STATUS_COLORS[r.status]?.label ?? '예약'} · ${r.guestName}`;
    return (
      <div
        title={fullTitle}
        className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold truncate leading-tight py-0.5`}
      >
        {event.title}
      </div>
    );
  }, [isMobile]);

  // 커스텀 "더 보기" 컴포넌트
  const ShowMoreComponent = useCallback(({ count, slotMetrics, events: slotEvents }: { count: number; slotMetrics: any; events: ReservationEvent[] }) => {
    return (
      <div
        className="text-[10px] md:text-xs text-primary font-bold hover:bg-primary/20 cursor-pointer py-1 px-1 bg-primary/10 rounded w-full text-center mt-1 border border-primary/30 transition-all transform active:scale-95 shadow-sm"
        onClick={(e) => {
          e.stopPropagation();
          // 날짜 정보 추출 (여러 경로 시도)
          const date = slotMetrics?.date || (slotEvents?.[0]?.start);

          if (date) {
            setSelectedDate(new Date(date));
            setIsInspectorOpen(true);
          } else {
            console.error('[Calendar] Failed to determine date for "Show More"');
          }
        }}
      >
        +{count}개
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

  // 월간 스캔을 위한 날짜 헤더(요약 칩) - 날짜 클릭 시 인스펙터 오픈
  const DateHeaderComponent = useCallback(({ date, label }: { date: Date; label: string }) => {
    const dayStart = startOfDay(date);
    const checkins = getReservationsForDate(dayStart, false);
    const unassigned = checkins.filter(r => !r.assignedRoom).length;
    const checkouts = reservations.filter(r => {
      try {
        return isSameDay(startOfDay(new Date(r.checkout)), dayStart);
      } catch {
        return false;
      }
    }).length;

    const showSummary = unassigned > 0 || checkins.length > 0 || checkouts > 0;

    return (
      <div
        className="flex flex-col gap-1 cursor-pointer select-none"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedDate(dayStart);
          setIsInspectorOpen(true);
        }}
        title={`${label} (미배정 ${unassigned} / 체크인 ${checkins.length} / 체크아웃 ${checkouts})`}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold">{label}</span>
        </div>
        {showSummary && (
          <div className="flex items-center gap-1 flex-wrap">
            {unassigned > 0 && (
              <span className="rounded bg-red-50 text-red-700 border border-red-200 px-1 py-0.5 text-[10px] leading-none">
                미 {unassigned}
              </span>
            )}
            {checkins.length > 0 && (
              <span className="rounded bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0.5 text-[10px] leading-none">
                입 {checkins.length}
              </span>
            )}
            {checkouts > 0 && (
              <span className="rounded bg-purple-50 text-purple-700 border border-purple-200 px-1 py-0.5 text-[10px] leading-none">
                퇴 {checkouts}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }, [getReservationsForDate, reservations]);

  // 날짜 클릭 핸들러 (모달로 해당 날짜의 예약 표시)
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    const clickedDate = slotInfo.start;
    setSelectedDate(clickedDate);
    setIsInspectorOpen(true);
  }, []);

  // 이벤트 클릭 핸들러 (하이브리드 방식)
  const handleSelectEvent = useCallback((event: ReservationEvent) => {
    // 타입 안전성 체크
    if (!event.start || !(event.start instanceof Date)) {
      debugWarn('[Calendar] Event has invalid start date:', event);
      return;
    }

    // 체크인 건수 이벤트인 경우 (간소화된 버전) 또는 그룹화된 이벤트인 경우 해당 날짜의 모달 열기
    if (event.id.startsWith('checkin-') || event.id.startsWith('group-')) {
      const date = new Date(event.start);
      setSelectedDate(date);
      setIsInspectorOpen(true);
    } else {
      // 개별 이벤트인 경우 상세 페이지로 이동
      router.push(`/admin/reservations/${event.resource.id}`);
    }
  }, [router]);

  // 예약 상세 페이지로 이동
  const handleViewDetail = useCallback((reservationId: string) => {
    router.push(`/admin/reservations/${reservationId}`);
    handleCloseInspector();
  }, [router, handleCloseInspector]);

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
    showMore: (total: number) => `+${total}개`,
  };

  // 선택된 날짜의 예약 목록(정렬된 전체)
  const selectedDateAllReservations = useMemo(() => {
    if (!selectedDate) return [];

    const dateReservations = getReservationsForDate(selectedDate, false);

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

  // 선택된 날짜의 예약 목록(인스펙터 표시용: 토글 반영)
  const selectedDateReservations = useMemo(() => {
    return onlyUnassignedInInspector
      ? selectedDateAllReservations.filter((r) => !r.assignedRoom)
      : selectedDateAllReservations;
  }, [selectedDateAllReservations, onlyUnassignedInInspector]);

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
    const meta = getReservationStatusMeta(status);
    return <StatusPill label={meta.label} className={meta.className} />;
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

      // 해당 날짜의 체크인 인원만을 기준으로 목록 생성
      const dayReservations = getReservationsForDate(day, false);

      return {
        date: day,
        reservations: dayReservations,
        isExpanded,
      };
    }).filter(dayObj => dayObj.reservations.length > 0 || expandedDates.has(format(dayObj.date, 'yyyy-MM-dd')));
  }, [currentDate, getReservationsForDate, expandedDates, calendarViewType]);

  return (
    <>

      {/* 그리드 뷰 */}
      {
        viewType === 'grid' && (
          <div className="space-y-6">
            <div className="h-[calc(100vh-200px)] md:h-[700px] mt-4 rounded-lg border border-border bg-card overflow-y-auto shadow-sm">
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
                  // "+N개 더 보기" 클릭 시 해당 날짜의 예약 리스트 정보를 담은 모달을 열어 "확장"된 느낌 제공
                  setSelectedDate(date);
                  setIsInspectorOpen(true);
                }}
                eventPropGetter={eventStyleGetter}
                components={{
                  ...components,
                  month: {
                    dateHeader: DateHeaderComponent as any,
                  },
                }}
                messages={messages}
                culture="ko"
                selectable
                popup={false} // 커스텀 Dialog를 사용하여 "동일한 양식"으로 확장시키기 위해 false 유지
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
          </div>
        )
      }

      {/* 타임라인 뷰 - 일자별 세로 리스트 */}
      {
        calendarViewType === 'timeline' && (
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
                  이번 달
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
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <div className="font-bold text-base text-foreground">
                              {format(date, 'M월 d일 (EEE)', { locale: ko })}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span className="inline-block w-1 h-1 rounded-full bg-primary/40"></span>
                              {isExpanded ? '전체 예약 현황' : `${reservations.length}건의 체크인`}
                            </div>
                          </div>
                        </div>
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

                          return displayReservations.map((reservation, index) => (
                            <div
                              key={reservation.id}
                              className={`flex items-center justify-between p-3 rounded-md transition-all cursor-pointer border ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                                } border-border/60 hover:bg-primary/5 hover:border-primary/30 shadow-sm`}
                              onClick={() => handleViewDetail(reservation.id)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                                <div className="shrink-0">{getStatusBadge(reservation.status)}</div>
                                <div className="font-bold text-base shrink-0">{reservation.guestName}</div>
                                <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                                  <span className="font-semibold text-primary/70">{reservation.roomType.split('(')[0]}</span>
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                                    {calculateTotalAmount(reservation).totalAmount.toLocaleString()}원
                                  </span>
                                </div>
                              </div>

                              <div className="ml-2 shrink-0">
                                {!reservation.assignedRoom ? (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-8 px-4 text-xs font-bold bg-primary hover:bg-primary/90 shadow-md transform active:scale-95 transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickAssign(reservation);
                                    }}
                                  >
                                    배정
                                  </Button>
                                ) : (
                                  <Badge variant="outline" className="text-xs font-bold py-1 px-2.5 text-primary border-primary/50 bg-primary/5">
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
        )
      }

      {/* 날짜 인스펙터: 캘린더 컨텍스트를 유지한 채로 해당 날짜의 예약을 확인 */}
      {isMobile ? (
        <Drawer open={isInspectorOpen} onOpenChange={(open) => !open && handleCloseInspector()}>
          <DrawerContent className="max-h-[90vh]" {...swipeHandlers}>
            <div className="mx-auto w-full max-w-lg flex min-h-0 flex-1 flex-col overflow-hidden">
              <DrawerHeader className="px-4 py-3 border-b bg-background">
                <DrawerTitle className="text-lg font-semibold">
                  {selectedDate && format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })} 예약
                </DrawerTitle>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {selectedDateAllReservations.length === 0
                      ? '이 날짜에는 예약이 없습니다.'
                      : onlyUnassignedInInspector
                        ? `미배정 ${selectedDateReservations.length}건 / 전체 ${selectedDateAllReservations.length}건`
                        : `총 ${selectedDateAllReservations.length}건`}
                  </p>
                  <Button
                    type="button"
                    variant={onlyUnassignedInInspector ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 px-3 text-xs font-bold"
                    onClick={() => setOnlyUnassignedInInspector((v) => !v)}
                    aria-pressed={onlyUnassignedInInspector}
                  >
                    미배정만
                  </Button>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 min-h-0 overscroll-contain [-webkit-overflow-scrolling:touch]">
                {selectedDateReservations.length > 0 ? (
                  <div className="space-y-3">
                    <Tabs
                      key={onlyUnassignedInInspector ? 'unassigned' : 'all'}
                      defaultValue="all"
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-5 h-auto p-1 gap-1">
                        <TabsTrigger value="all" className="text-base min-h-[36px] px-1">
                          전체
                        </TabsTrigger>
                        <TabsTrigger value="assigned" className="text-base min-h-[36px] px-1" disabled={onlyUnassignedInInspector}>
                          배정
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="text-base min-h-[36px] px-1" disabled={onlyUnassignedInInspector}>
                          대기
                        </TabsTrigger>
                        <TabsTrigger value="checked_in" className="text-base min-h-[36px] px-1" disabled={onlyUnassignedInInspector}>
                          체크인
                        </TabsTrigger>
                        <TabsTrigger value="checked_out" className="text-base min-h-[36px] px-1" disabled={onlyUnassignedInInspector}>
                          체크아웃
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="all" className="mt-4 space-y-2">
                        {selectedDateReservations.map((reservation, index) => (
                          <div
                            key={reservation.id}
                            className={`flex items-center justify-between p-3 rounded-md transition-all cursor-pointer border ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                              } border-border/60 hover:bg-primary/5 hover:border-primary/30 shadow-sm`}
                            onClick={() => handleViewDetail(reservation.id)}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                              <div className="shrink-0">{getStatusBadge(reservation.status)}</div>
                              <div className="font-bold text-base shrink-0">{reservation.guestName}</div>
                              <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                                <span className="font-semibold text-primary/70">{reservation.roomType.split('(')[0]}</span>
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                                  {calculateTotalAmount(reservation).totalAmount.toLocaleString()}원
                                </span>
                              </div>
                            </div>
                            <div className="ml-2 shrink-0">
                              {!reservation.assignedRoom ? (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-8 px-4 text-xs font-bold bg-primary hover:bg-primary/90 shadow-md transform active:scale-95 transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAssign(reservation);
                                  }}
                                >
                                  배정
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-xs font-bold py-1 px-2.5 text-primary border-primary/50 bg-primary/5">
                                  {reservation.assignedRoom}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      {['assigned', 'pending', 'checked_in', 'checked_out'].map((status) => (
                        <TabsContent key={status} value={status} className="mt-4 space-y-2">
                          {sortReservationsByPriority(selectedDateReservations)
                            .filter(r => r.status === status)
                            .map((reservation, index) => (
                              <div
                                key={reservation.id}
                                className={`flex items-center justify-between p-3 rounded-md transition-all cursor-pointer border ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                                  } border-border/60 hover:bg-primary/5 hover:border-primary/30 shadow-sm`}
                                onClick={() => handleViewDetail(reservation.id)}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                                  <div className="shrink-0">{getStatusBadge(reservation.status)}</div>
                                  <div className="font-bold text-base shrink-0">{reservation.guestName}</div>
                                  <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                                    <span className="font-semibold text-primary/70">{reservation.roomType.split('(')[0]}</span>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                                      {calculateTotalAmount(reservation).totalAmount.toLocaleString()}원
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-2 shrink-0">
                                  {!reservation.assignedRoom ? (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-8 px-4 text-xs font-bold bg-primary hover:bg-primary/90 shadow-md transform active:scale-95 transition-all"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuickAssign(reservation);
                                      }}
                                    >
                                      배정
                                    </Button>
                                  ) : (
                                    <Badge variant="outline" className="text-xs font-bold py-1 px-2.5 text-primary border-primary/50 bg-primary/5">
                                      {reservation.assignedRoom}
                                    </Badge>
                                  )}
                                </div>
                              </div>
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
                    {selectedDateAllReservations.length > 0 && onlyUnassignedInInspector ? (
                      <>
                        <p className="font-medium">미배정 예약이 없습니다.</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4 h-10"
                          onClick={() => setOnlyUnassignedInInspector(false)}
                        >
                          전체 보기
                        </Button>
                      </>
                    ) : (
                      <p>이 날짜에는 예약이 없습니다.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-background">
                <Button variant="outline" className="w-full h-12" onClick={handleCloseInspector}>
                  닫기
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={isInspectorOpen} onOpenChange={(open) => !open && handleCloseInspector()}>
          <SheetContent side="right" className="w-[420px] sm:w-[520px] p-0 flex flex-col overflow-hidden">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-lg font-semibold">
                {selectedDate && format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })} 예약
              </SheetTitle>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {selectedDateAllReservations.length === 0
                    ? '이 날짜에는 예약이 없습니다.'
                    : onlyUnassignedInInspector
                      ? `미배정 ${selectedDateReservations.length}건 / 전체 ${selectedDateAllReservations.length}건`
                      : `총 ${selectedDateAllReservations.length}건`}
                </p>
                <Button
                  type="button"
                  variant={onlyUnassignedInInspector ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 px-3 text-xs font-bold"
                  onClick={() => setOnlyUnassignedInInspector((v) => !v)}
                  aria-pressed={onlyUnassignedInInspector}
                >
                  미배정만
                </Button>
              </div>
            </SheetHeader>

            <div className="p-4 min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {selectedDateReservations.length > 0 ? (
                <div className="space-y-3">
                  <Tabs
                    key={onlyUnassignedInInspector ? 'unassigned' : 'all'}
                    defaultValue="all"
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-5 h-auto p-1 gap-1">
                      <TabsTrigger value="all" className="text-sm min-h-[36px] px-1 md:px-3">
                        전체
                      </TabsTrigger>
                      <TabsTrigger value="assigned" className="text-sm min-h-[36px] px-1 md:px-3" disabled={onlyUnassignedInInspector}>
                        배정
                      </TabsTrigger>
                      <TabsTrigger value="pending" className="text-sm min-h-[36px] px-1 md:px-3" disabled={onlyUnassignedInInspector}>
                        대기
                      </TabsTrigger>
                      <TabsTrigger value="checked_in" className="text-sm min-h-[36px] px-1 md:px-3" disabled={onlyUnassignedInInspector}>
                        체크인
                      </TabsTrigger>
                      <TabsTrigger value="checked_out" className="text-sm min-h-[36px] px-1 md:px-3" disabled={onlyUnassignedInInspector}>
                        체크아웃
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-4 space-y-2">
                      {selectedDateReservations.map((reservation, index) => (
                        <div
                          key={reservation.id}
                          className={`flex items-center justify-between p-3 rounded-md transition-all cursor-pointer border ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                            } border-border/60 hover:bg-primary/5 hover:border-primary/30 shadow-sm`}
                          onClick={() => handleViewDetail(reservation.id)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                            <div className="shrink-0">{getStatusBadge(reservation.status)}</div>
                            <div className="font-bold text-base shrink-0">{reservation.guestName}</div>
                            <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                              <span className="font-semibold text-primary/70">{reservation.roomType.split('(')[0]}</span>
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                                {calculateTotalAmount(reservation).totalAmount.toLocaleString()}원
                              </span>
                            </div>
                          </div>
                          <div className="ml-2 shrink-0">
                            {!reservation.assignedRoom ? (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 px-4 text-xs font-bold bg-primary hover:bg-primary/90 shadow-md transform active:scale-95 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAssign(reservation);
                                }}
                              >
                                배정
                              </Button>
                            ) : (
                              <Badge variant="outline" className="text-xs font-bold py-1 px-2.5 text-primary border-primary/50 bg-primary/5">
                                {reservation.assignedRoom}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    {['assigned', 'pending', 'checked_in', 'checked_out'].map((status) => (
                      <TabsContent key={status} value={status} className="mt-4 space-y-2">
                        {sortReservationsByPriority(selectedDateReservations)
                          .filter(r => r.status === status)
                          .map((reservation, index) => (
                            <div
                              key={reservation.id}
                              className={`flex items-center justify-between p-3 rounded-md transition-all cursor-pointer border ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                                } border-border/60 hover:bg-primary/5 hover:border-primary/30 shadow-sm`}
                              onClick={() => handleViewDetail(reservation.id)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                                <div className="shrink-0">{getStatusBadge(reservation.status)}</div>
                                <div className="font-bold text-base shrink-0">{reservation.guestName}</div>
                                <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                                  <span className="font-semibold text-primary/70">{reservation.roomType.split('(')[0]}</span>
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                                    {calculateTotalAmount(reservation).totalAmount.toLocaleString()}원
                                  </span>
                                </div>
                              </div>
                              <div className="ml-2 shrink-0">
                                {!reservation.assignedRoom ? (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-8 px-4 text-xs font-bold bg-primary hover:bg-primary/90 shadow-md transform active:scale-95 transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickAssign(reservation);
                                    }}
                                  >
                                    배정
                                  </Button>
                                ) : (
                                  <Badge variant="outline" className="text-xs font-bold py-1 px-2.5 text-primary border-primary/50 bg-primary/5">
                                    {reservation.assignedRoom}
                                  </Badge>
                                )}
                              </div>
                            </div>
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
                  {selectedDateAllReservations.length > 0 && onlyUnassignedInInspector ? (
                    <>
                      <p className="font-medium">미배정 예약이 없습니다.</p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4 h-10"
                        onClick={() => setOnlyUnassignedInInspector(false)}
                      >
                        전체 보기
                      </Button>
                    </>
                  ) : (
                    <p>이 날짜에는 예약이 없습니다.</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-background">
              <Button variant="outline" className="w-full h-12" onClick={handleCloseInspector}>
                닫기
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}

      <RoomAssignmentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        reservation={assigningReservation}
        onAssignSuccess={() => router.refresh()}
      />
    </>
  );
}
