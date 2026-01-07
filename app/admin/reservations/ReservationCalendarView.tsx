'use client';

import { useMemo, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View, Event, SlotInfo, Components } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { type Reservation } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// 상태별 색상 시스템 (강화)
const STATUS_COLORS: Record<Reservation['status'], { bg: string; text: string; label: string }> = {
  pending: { bg: '#6B7280', text: 'white', label: '대기' },
  assigned: { bg: '#2563EB', text: 'white', label: '배정' },
  checked_in: { bg: '#059669', text: 'white', label: '체크인' },
  checked_out: { bg: '#7C3AED', text: 'white', label: '체크아웃' },
  cancelled: { bg: '#DC2626', text: 'white', label: '취소' },
};

// 하이브리드 방식 임계값
const MAX_INDIVIDUAL_DISPLAY = 5;

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    
    // 하이브리드 방식: 날짜별로 그룹화하여 이벤트 생성
    const eventMap = new Map<string, ReservationEvent>();
    
    validReservations.forEach((reservation) => {
      try {
        // 체크인 날짜 (시작일) - 날짜만 사용 (시간 제거)
        const checkinDate = new Date(reservation.checkin);
        const startDate = new Date(checkinDate.getFullYear(), checkinDate.getMonth(), checkinDate.getDate());
        startDate.setHours(0, 0, 0, 0);

        // 체크아웃 날짜 (종료일) - 체크아웃 날짜 포함 (하루 종일 표시)
        const checkoutDate = new Date(reservation.checkout);
        const endDate = new Date(checkoutDate.getFullYear(), checkoutDate.getMonth(), checkoutDate.getDate());
        endDate.setHours(23, 59, 59, 999);

        // 체크아웃이 체크인보다 이전이면 체크인 다음 날로 설정
        if (endDate < startDate) {
          console.warn('[Calendar] Checkout before checkin, adjusting:', {
            reservationId: reservation.id,
            checkin: reservation.checkin,
            checkout: reservation.checkout,
          });
          endDate.setTime(startDate.getTime());
          endDate.setDate(endDate.getDate() + 1);
          endDate.setHours(23, 59, 59, 999);
        }

        // 체크인부터 체크아웃까지 각 날짜별로 이벤트 생성
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateKey = format(currentDate, 'yyyy-MM-dd');
          const dateReservations = reservationsByDate[dateKey] || [];
          const isGrouped = dateReservations.length > MAX_INDIVIDUAL_DISPLAY;
          
          if (isGrouped) {
            // 그룹화된 날짜: 상태별로 하나의 이벤트만 생성 (해당 날짜에만)
            const statusKey = `${dateKey}-${reservation.status}`;
            if (!eventMap.has(statusKey)) {
              // 해당 날짜의 해당 상태 예약 개수 계산
              const statusCount = dateReservations.filter(r => r.status === reservation.status).length;
              // 해당 날짜의 해당 상태 예약 중 첫 번째를 대표로 사용
              const firstReservation = dateReservations.find(r => r.status === reservation.status);
              if (firstReservation && statusCount > 0) {
                // 해당 날짜에만 이벤트 생성 (하루 종일)
                const dayStart = new Date(currentDate);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(currentDate);
                dayEnd.setHours(23, 59, 59, 999);
                
                eventMap.set(statusKey, {
                  id: `group-${statusKey}`,
                  title: `${STATUS_COLORS[reservation.status].label}: ${statusCount}건`,
                  start: dayStart,
                  end: dayEnd,
                  resource: firstReservation, // 대표 예약
                });
              }
            }
          } else {
            // 개별 표시: 각 예약을 개별 이벤트로 생성
            const eventKey = `${dateKey}-${reservation.id}`;
            if (!eventMap.has(eventKey)) {
              // 해당 날짜에만 이벤트 생성 (하루 종일)
              const dayStart = new Date(currentDate);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(currentDate);
              dayEnd.setHours(23, 59, 59, 999);
              
              eventMap.set(eventKey, {
                id: `${reservation.id}-${dateKey}`, // 날짜별로 고유 ID
                title: `${reservation.guestName}${reservation.assignedRoom ? ` (${reservation.assignedRoom})` : ' (미배정)'}`,
                start: dayStart,
                end: dayEnd,
                resource: reservation,
              });
            }
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } catch (error) {
        console.error('[Calendar] Error creating event:', {
          reservationId: reservation.id,
          error,
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
    
    console.log('[Calendar] Generated events:', {
      total: events.length,
      grouped: events.filter(e => e.id.startsWith('group-')).length,
      individual: events.filter(e => !e.id.startsWith('group-')).length,
      dateRange,
    });
    
    return events;
  }, [reservations, reservationsByDate]);


  // 이벤트 스타일 커스터마이징 (개선된 색상 시스템)
  const eventStyleGetter = (event: ReservationEvent) => {
    const status = event.resource.status;
    const colorConfig = STATUS_COLORS[status] || STATUS_COLORS.pending;
    
    // 날짜별 예약 개수 확인 (타입 안전성 보장)
    if (!event.start || !(event.start instanceof Date)) {
      // 기본 스타일 반환
      return {
        style: {
          backgroundColor: colorConfig.bg,
          borderRadius: '4px',
          opacity: 0.95,
          color: colorConfig.text,
          border: '0px',
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: '600',
          padding: '4px 8px',
          cursor: 'pointer',
          marginBottom: '2px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      };
    }
    
    const eventDate = format(event.start, 'yyyy-MM-dd');
    const dateReservations = reservationsByDate[eventDate] || [];
    const isGrouped = dateReservations.length > MAX_INDIVIDUAL_DISPLAY;
    
    return {
      style: {
        backgroundColor: colorConfig.bg,
        borderRadius: '4px',
        opacity: 0.95,
        color: colorConfig.text,
        border: '0px',
        display: 'block',
        fontSize: isGrouped ? '0.7rem' : '0.75rem',
        fontWeight: isGrouped ? '700' : '600',
        padding: isGrouped ? '2px 6px' : '4px 8px',
        cursor: 'pointer',
        marginBottom: '2px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    };
  };

  // 커스텀 이벤트 컴포넌트 (하이브리드 방식)
  const EventComponent = useCallback(({ event }: { event: ReservationEvent }) => {
    const reservation = event.resource;
    const colorConfig = STATUS_COLORS[reservation.status] || STATUS_COLORS.pending;
    const isGrouped = event.id.startsWith('group-');
    
    if (isGrouped) {
      // 그룹 카운트 표시
      return (
        <div
          style={{
            backgroundColor: colorConfig.bg,
            color: colorConfig.text,
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '700',
            textAlign: 'center',
            width: '100%',
          }}
          title={event.title}
        >
          {event.title}
        </div>
      );
    } else {
      // 개별 표시
      return (
        <div
          style={{
            backgroundColor: colorConfig.bg,
            color: colorConfig.text,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
          }}
          title={`${reservation.guestName} ${reservation.assignedRoom || '미배정'}`}
        >
          {reservation.guestName} {reservation.assignedRoom ? `(${reservation.assignedRoom})` : '(미)'}
        </div>
      );
    }
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
    
    // 그룹화된 이벤트인 경우 해당 날짜의 모달 열기
    if (event.id.startsWith('group-')) {
      const eventDate = format(event.start, 'yyyy-MM-dd');
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

  // 선택된 날짜의 예약 목록
  const selectedDateReservations = selectedDate 
    ? getReservationsForDate(selectedDate)
    : [];

  // 상태별 배지 (개선된 색상 시스템 사용)
  const getStatusBadge = (status: Reservation['status']) => {
    const colorConfig = STATUS_COLORS[status] || STATUS_COLORS.pending;
    const variants: Record<Reservation['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: '대기', variant: 'outline' },
      assigned: { label: '배정 완료', variant: 'secondary' },
      checked_in: { label: '체크인', variant: 'default' },
      checked_out: { label: '체크아웃', variant: 'secondary' },
      cancelled: { label: '취소', variant: 'destructive' },
    };
    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <>
      <div className="h-[500px] md:h-[600px] mt-4 rounded-lg border border-border bg-card overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', padding: '12px' }}
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
          // 모바일에서는 월간 뷰만 허용
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
        />
      </div>

      {/* 날짜별 예약 목록 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })} 예약 목록
            </DialogTitle>
            <DialogDescription>
              {selectedDateReservations.length > 0 
                ? `총 ${selectedDateReservations.length}건의 예약이 있습니다.`
                : '이 날짜에는 예약이 없습니다.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDateReservations.length > 0 ? (
            <div className="space-y-3 mt-4">
              {/* 상태별 탭 분리 */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">
                    전체 ({selectedDateReservations.length})
                  </TabsTrigger>
                  <TabsTrigger value="assigned">
                    배정 ({selectedDateReservations.filter(r => r.status === 'assigned').length})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    대기 ({selectedDateReservations.filter(r => r.status === 'pending').length})
                  </TabsTrigger>
                  <TabsTrigger value="checked_in">
                    체크인 ({selectedDateReservations.filter(r => r.status === 'checked_in').length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4 space-y-3">
                  {selectedDateReservations.map((reservation) => {
                    const checkin = new Date(reservation.checkin);
                    const checkout = new Date(reservation.checkout);
                    const isCheckinDay = selectedDate ? isSameDay(checkin, selectedDate) : false;
                    const isCheckoutDay = selectedDate ? isSameDay(checkout, selectedDate) : false;
                    
                    return (
                      <Card 
                        key={reservation.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleViewDetail(reservation.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-base">
                                  {reservation.guestName}
                                </h4>
                                {getStatusBadge(reservation.status)}
                              </div>
                              
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">예약번호:</span>
                                  <span>{reservation.reservationNumber}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">체크인:</span>
                                  <span>{format(checkin, 'yyyy-MM-dd')}</span>
                                  {isCheckinDay && (
                                    <Badge variant="outline" className="text-xs">체크인일</Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">체크아웃:</span>
                                  <span>{format(checkout, 'yyyy-MM-dd')}</span>
                                  {isCheckoutDay && (
                                    <Badge variant="outline" className="text-xs">체크아웃일</Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">방 배정:</span>
                                  <span className={reservation.assignedRoom ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                    {reservation.assignedRoom || '미배정'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">객실:</span>
                                  <span className="text-foreground">{reservation.roomType}</span>
                                </div>
                                
                                {reservation.options && reservation.options.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium">옵션:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {reservation.options.map((opt, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {opt.optionName}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0 text-right">
                              <div className="text-lg font-bold text-primary">
                                {(() => {
                                  const roomAmount = parseInt(reservation.amount || '0');
                                  const optionsAmount = reservation.options?.reduce((sum, opt) => sum + opt.optionPrice, 0) || 0;
                                  return (roomAmount + optionsAmount).toLocaleString();
                                })()}원
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetail(reservation.id);
                                  }}
                                >
                                  상세 보기
                                </Button>
                                {!reservation.assignedRoom && (
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/admin/reservations/${reservation.id}`);
                                      handleCloseModal();
                                    }}
                                  >
                                    방 배정
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>
                
                <TabsContent value="assigned" className="mt-4 space-y-3">
                  {selectedDateReservations
                    .filter(r => r.status === 'assigned')
                    .map((reservation) => {
                      const checkin = new Date(reservation.checkin);
                      const checkout = new Date(reservation.checkout);
                      const isCheckinDay = selectedDate ? isSameDay(checkin, selectedDate) : false;
                      const isCheckoutDay = selectedDate ? isSameDay(checkout, selectedDate) : false;
                      
                      return (
                        <Card 
                          key={reservation.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleViewDetail(reservation.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-base">
                                    {reservation.guestName}
                                  </h4>
                                  {getStatusBadge(reservation.status)}
                                </div>
                                
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">예약번호:</span>
                                    <span>{reservation.reservationNumber}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">체크인:</span>
                                    <span>{format(checkin, 'yyyy-MM-dd')}</span>
                                    {isCheckinDay && (
                                      <Badge variant="outline" className="text-xs">체크인일</Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">체크아웃:</span>
                                    <span>{format(checkout, 'yyyy-MM-dd')}</span>
                                    {isCheckoutDay && (
                                      <Badge variant="outline" className="text-xs">체크아웃일</Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">방 배정:</span>
                                    <span className="text-foreground font-medium">
                                      {reservation.assignedRoom || '미배정'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex-shrink-0 text-right">
                                <div className="text-lg font-bold text-primary">
                                  {(() => {
                                    const roomAmount = parseInt(reservation.amount || '0');
                                    const optionsAmount = reservation.options?.reduce((sum, opt) => sum + opt.optionPrice, 0) || 0;
                                    return (roomAmount + optionsAmount).toLocaleString();
                                  })()}원
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetail(reservation.id);
                                  }}
                                >
                                  상세 보기
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </TabsContent>
                
                <TabsContent value="pending" className="mt-4 space-y-3">
                  {selectedDateReservations
                    .filter(r => r.status === 'pending')
                    .map((reservation) => {
                      const checkin = new Date(reservation.checkin);
                      const checkout = new Date(reservation.checkout);
                      
                      return (
                        <Card 
                          key={reservation.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleViewDetail(reservation.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-base">
                                    {reservation.guestName}
                                  </h4>
                                  {getStatusBadge(reservation.status)}
                                </div>
                                
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">예약번호:</span>
                                    <span>{reservation.reservationNumber}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">체크인:</span>
                                    <span>{format(checkin, 'yyyy-MM-dd')}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">체크아웃:</span>
                                    <span>{format(checkout, 'yyyy-MM-dd')}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">방 배정:</span>
                                    <span className="text-muted-foreground">
                                      {reservation.assignedRoom || '미배정'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex-shrink-0 text-right">
                                <div className="text-lg font-bold text-primary">
                                  {(() => {
                                    const roomAmount = parseInt(reservation.amount || '0');
                                    const optionsAmount = reservation.options?.reduce((sum, opt) => sum + opt.optionPrice, 0) || 0;
                                    return (roomAmount + optionsAmount).toLocaleString();
                                  })()}원
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetail(reservation.id);
                                    }}
                                  >
                                    상세 보기
                                  </Button>
                                  {!reservation.assignedRoom && (
                                    <Button 
                                      variant="default" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/admin/reservations/${reservation.id}`);
                                        handleCloseModal();
                                      }}
                                    >
                                      방 배정
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </TabsContent>
                
                <TabsContent value="checked_in" className="mt-4 space-y-3">
                  {selectedDateReservations
                    .filter(r => r.status === 'checked_in')
                    .map((reservation) => {
                      const checkin = new Date(reservation.checkin);
                      const checkout = new Date(reservation.checkout);
                      
                      return (
                        <Card 
                          key={reservation.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleViewDetail(reservation.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-base">
                                    {reservation.guestName}
                                  </h4>
                                  {getStatusBadge(reservation.status)}
                                </div>
                                
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">예약번호:</span>
                                    <span>{reservation.reservationNumber}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">체크인:</span>
                                    <span>{format(checkin, 'yyyy-MM-dd')}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">체크아웃:</span>
                                    <span>{format(checkout, 'yyyy-MM-dd')}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">방 배정:</span>
                                    <span className="text-foreground font-medium">
                                      {reservation.assignedRoom || '미배정'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex-shrink-0 text-right">
                                <div className="text-lg font-bold text-primary">
                                  {(() => {
                                    const roomAmount = parseInt(reservation.amount || '0');
                                    const optionsAmount = reservation.options?.reduce((sum, opt) => sum + opt.optionPrice, 0) || 0;
                                    return (roomAmount + optionsAmount).toLocaleString();
                                  })()}원
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetail(reservation.id);
                                  }}
                                >
                                  상세 보기
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              이 날짜에는 예약이 없습니다.
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={handleCloseModal}>
              닫기
            </Button>
            {selectedDate && (
              <Button 
                onClick={() => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  router.push(`/admin/reservations?checkin=${dateStr}`);
                  handleCloseModal();
                }}
              >
                필터 적용
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
