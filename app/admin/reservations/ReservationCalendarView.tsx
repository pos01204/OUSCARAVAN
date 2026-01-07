'use client';

import { useMemo, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View, Event, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { type Reservation } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

  // 예약 데이터를 캘린더 이벤트로 변환
  const events: ReservationEvent[] = useMemo(() => {
    console.log('[Calendar] Processing reservations:', reservations.length);
    
    const validReservations = reservations.filter((reservation) => {
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
    });
    
    console.log('[Calendar] Valid reservations:', validReservations.length);
    
    const events = validReservations.map((reservation) => {
      // 체크인 날짜 (시작일) - 날짜만 사용 (시간 제거)
      const checkinDate = new Date(reservation.checkin);
      const startDate = new Date(checkinDate.getFullYear(), checkinDate.getMonth(), checkinDate.getDate());
      startDate.setHours(0, 0, 0, 0); // 자정으로 설정

      // 체크아웃 날짜 (종료일) - 체크아웃 날짜 포함 (하루 종일 표시)
      const checkoutDate = new Date(reservation.checkout);
      const endDate = new Date(checkoutDate.getFullYear(), checkoutDate.getMonth(), checkoutDate.getDate());
      endDate.setHours(23, 59, 59, 999); // 해당 날짜의 마지막 시간으로 설정

      // 체크아웃이 체크인보다 이전이면 체크인 다음 날로 설정
      if (endDate < startDate) {
        endDate.setTime(startDate.getTime());
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(23, 59, 59, 999);
      }

      return {
        id: reservation.id,
        title: `${reservation.guestName}${reservation.assignedRoom ? ` (${reservation.assignedRoom})` : ' (미배정)'}`,
        start: startDate,
        end: endDate,
        resource: reservation,
      };
    });
    
    console.log('[Calendar] Generated events:', events.length);
    return events;
  }, [reservations]);

  // 이벤트 스타일 커스터마이징
  const eventStyleGetter = (event: ReservationEvent) => {
    const status = event.resource.status;
    const colors: Record<Reservation['status'], string> = {
      pending: '#9CA3AF',      // gray-400
      assigned: '#3B82F6',    // blue-500
      checked_in: '#10B981',   // green-500
      checked_out: '#8B5CF6', // purple-500
      cancelled: '#EF4444',    // red-500
    };
    
    return {
      style: {
        backgroundColor: colors[status] || colors.pending,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: '600',
        padding: '4px 8px',
        cursor: 'pointer',
      },
    };
  };

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

  // 이벤트 클릭 핸들러 (예약 상세 페이지로 이동)
  const handleSelectEvent = useCallback((event: ReservationEvent) => {
    router.push(`/admin/reservations/${event.resource.id}`);
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

  // 상태별 색상
  const getStatusBadge = (status: Reservation['status']) => {
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
              {selectedDateReservations.map((reservation) => {
                const checkin = new Date(reservation.checkin);
                const checkout = new Date(reservation.checkout);
                const isCheckinDay = isSameDay(checkin, selectedDate!);
                const isCheckoutDay = isSameDay(checkout, selectedDate!);
                
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
