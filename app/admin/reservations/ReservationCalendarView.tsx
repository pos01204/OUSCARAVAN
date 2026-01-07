'use client';

import { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, View, Event, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { type Reservation } from '@/lib/api';
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

  // 예약 데이터를 캘린더 이벤트로 변환
  const events: ReservationEvent[] = useMemo(() => {
    return reservations
      .filter((reservation) => {
        // 체크인/체크아웃 날짜가 유효한지 확인
        const checkin = new Date(reservation.checkin);
        const checkout = new Date(reservation.checkout);
        return !isNaN(checkin.getTime()) && !isNaN(checkout.getTime());
      })
      .map((reservation) => {
        // 체크인 날짜 (시작일)
        const startDate = new Date(reservation.checkin);
        startDate.setHours(14, 0, 0, 0); // 체크인 시간: 오후 2시

        // 체크아웃 날짜 (종료일) - 체크아웃 날짜의 다음 날로 설정 (하루 종일 표시)
        const endDate = new Date(reservation.checkout);
        endDate.setHours(11, 0, 0, 0); // 체크아웃 시간: 오전 11시

        // 체크아웃이 체크인보다 이전이면 체크인 다음 날로 설정
        if (endDate <= startDate) {
          endDate.setTime(startDate.getTime());
          endDate.setDate(endDate.getDate() + 1);
        }

        return {
          id: reservation.id,
          title: `${reservation.guestName}${reservation.assignedRoom ? ` (${reservation.assignedRoom})` : ' (미배정)'}`,
          start: startDate,
          end: endDate,
          resource: reservation,
        };
      });
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

  // 날짜 클릭 핸들러 (해당 날짜의 예약 필터링)
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const selectedDate = format(slotInfo.start, 'yyyy-MM-dd');
    router.push(`/admin/reservations?checkin=${selectedDate}`);
  };

  // 이벤트 클릭 핸들러 (예약 상세 페이지로 이동)
  const handleSelectEvent = (event: ReservationEvent) => {
    router.push(`/admin/reservations/${event.resource.id}`);
  };

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

  return (
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
        popup
        popupOffset={{ x: 10, y: 10 }}
        formats={{
          dayFormat: 'D',
          dayHeaderFormat: (date, culture, localizer) => {
            return localizer?.format(date, 'EEE', culture) || '';
          },
          dayRangeHeaderFormat: ({ start, end }) =>
            `${format(start, 'M월 D일', { locale: ko })} - ${format(end, 'M월 D일', { locale: ko })}`,
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
  );
}
