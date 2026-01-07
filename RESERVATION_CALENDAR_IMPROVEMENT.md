# 예약 관리 페이지 캘린더 개선안

## 📋 개요

현재 예약 관리 페이지를 캘린더 형식으로 개선하여 한 달의 예약 현황을 일목요연하게 확인할 수 있도록 합니다. 리스트 뷰와 캘린더 뷰를 전환할 수 있는 하이브리드 방식으로 구현하여 사용자의 편의성을 극대화합니다.

## 🎯 목표

1. **시각적 직관성**: 한 달의 예약 현황을 한눈에 파악
2. **효율적인 관리**: 날짜별 예약 상태를 빠르게 확인
3. **통일된 UX/UI**: 기존 디자인 시스템과 일관성 유지
4. **반응형 디자인**: 모바일/태블릿/데스크톱 모두 지원

## 🛠️ 기술 스택

### 추천 라이브러리

#### 1. **react-big-calendar** (권장)
- **장점**:
  - React 생태계에서 가장 인기 있는 캘린더 라이브러리
  - 월간/주간/일간 뷰 지원
  - 드래그 앤 드롭 지원
  - 커스터마이징 용이
  - TypeScript 지원
  - shadcn/ui와 스타일 통합 가능
- **단점**:
  - moment.js 또는 date-fns 의존성 필요
- **설치**: `npm install react-big-calendar date-fns @types/react-big-calendar`

#### 2. **대안: FullCalendar**
- 더 강력한 기능이지만 번들 크기가 큼
- React 버전: `@fullcalendar/react`

#### 3. **대안: 직접 구현 (date-fns)**
- 가장 가볍지만 구현 복잡도 높음
- 현재 프로젝트에 이미 date-fns 없음

### 선택: **react-big-calendar + date-fns**

## 📐 UI/UX 디자인

### 레이아웃 구조

```
┌─────────────────────────────────────────────────────────┐
│  예약 관리                                    [리스트/캘린더] │
├─────────────────────────────────────────────────────────┤
│  [필터] [검색] [상태] [날짜]                    [적용] [초기화] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [◀ 이전 달]   2026년 1월   [다음 달 ▶]        │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  일  월  화  수  목  금  토                      │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  [1] [2] [3] [4] [5] [6] [7]                    │   │
│  │  [8] [9] [10] [11] [12] [13] [14]              │   │
│  │  [15] [16] [17] [18] [19] [20] [21]            │   │
│  │  [22] [23] [24] [25] [26] [27] [28]            │   │
│  │  [29] [30] [31]                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  예약 이벤트 표시:                                       │
│  ┌─────────────────────────────────────────────┐       │
│  │ 🟢 배*윤님 (A1) - 체크인                     │       │
│  │ 🟡 장*령님 (B1) - 배정 완료                  │       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### 디자인 원칙

1. **색상 시스템**:
   - 대기 (pending): 회색 (`gray-400`)
   - 배정 완료 (assigned): 파란색 (`blue-500`)
   - 체크인 (checked_in): 초록색 (`green-500`)
   - 체크아웃 (checked_out): 보라색 (`purple-500`)
   - 취소 (cancelled): 빨간색 (`red-500`)

2. **타이포그래피**:
   - 기존 shadcn/ui 스타일 유지
   - 날짜: `text-sm font-medium`
   - 예약 정보: `text-xs font-semibold`

3. **인터랙션**:
   - 날짜 클릭: 해당 날짜의 예약 목록 필터링
   - 예약 이벤트 클릭: 예약 상세 페이지로 이동
   - 호버: 예약 정보 툴팁 표시
   - 드래그: 예약 날짜 변경 (선택사항)

## 🏗️ 구현 계획

### Phase 1: 기본 캘린더 뷰

#### 1.1 의존성 설치
```bash
npm install react-big-calendar date-fns @types/react-big-calendar
```

#### 1.2 파일 구조
```
app/admin/reservations/
├── page.tsx                    # 메인 페이지 (뷰 전환)
├── ReservationFiltersClient.tsx # 필터 컴포넌트
├── ReservationListView.tsx     # 리스트 뷰 (기존)
└── ReservationCalendarView.tsx # 캘린더 뷰 (신규)
```

#### 1.3 컴포넌트 구조

**ReservationCalendarView.tsx**:
```typescript
'use client';

import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Reservation } from '@/lib/api';
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

interface ReservationEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Reservation;
}

export function ReservationCalendarView({
  reservations,
}: {
  reservations: Reservation[];
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  // 예약 데이터를 캘린더 이벤트로 변환
  const events: ReservationEvent[] = useMemo(() => {
    return reservations.map((reservation) => ({
      id: reservation.id,
      title: `${reservation.guestName} (${reservation.assignedRoom || '미배정'})`,
      start: new Date(reservation.checkin),
      end: new Date(reservation.checkout),
      resource: reservation,
    }));
  }, [reservations]);

  // 이벤트 스타일 커스터마이징
  const eventStyleGetter = (event: ReservationEvent) => {
    const status = event.resource.status;
    const colors = {
      pending: '#9CA3AF',      // gray-400
      assigned: '#3B82F6',    // blue-500
      checked_in: '#10B981',   // green-500
      checked_out: '#8B5CF6', // purple-500
      cancelled: '#EF4444',    // red-500
    };
    
    return {
      style: {
        backgroundColor: colors[status] || colors.pending,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: '600',
        padding: '2px 4px',
      },
    };
  };

  // 날짜 클릭 핸들러
  const handleSelectSlot = ({ start }: { start: Date }) => {
    // 해당 날짜의 예약 필터링 (구현 필요)
    console.log('Selected date:', start);
  };

  // 이벤트 클릭 핸들러
  const handleSelectEvent = (event: ReservationEvent) => {
    window.location.href = `/admin/reservations/${event.resource.id}`;
  };

  return (
    <div className="h-[600px] mt-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view={view}
        onView={setView}
        date={currentDate}
        onNavigate={setCurrentDate}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        messages={{
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
        }}
        culture="ko"
        selectable
        popup
      />
    </div>
  );
}
```

### Phase 2: 뷰 전환 기능

#### 2.1 메인 페이지 수정

**page.tsx**:
```typescript
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, List } from 'lucide-react';
import { ReservationListView } from './ReservationListView';
import { ReservationCalendarView } from './ReservationCalendarView';

export default function ReservationsPage() {
  const [view, setView] = useState<'list' | 'calendar'>('calendar');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">예약 관리</h1>
          <p className="text-muted-foreground">
            예약 목록 및 관리
          </p>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
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
        </Tabs>
      </div>

      <ReservationFiltersClient />

      {view === 'calendar' ? (
        <ReservationCalendarView reservations={reservations} />
      ) : (
        <ReservationListView reservations={reservations} />
      )}
    </div>
  );
}
```

### Phase 3: 고급 기능

#### 3.1 툴팁 및 상세 정보
- 예약 이벤트 호버 시 상세 정보 표시
- shadcn/ui Tooltip 컴포넌트 사용

#### 3.2 필터 연동
- 캘린더 뷰에서도 필터 적용
- 날짜 범위 선택 시 해당 기간만 표시

#### 3.3 반응형 디자인
- 모바일: 월간 뷰만 표시
- 태블릿: 월간/주간 뷰
- 데스크톱: 모든 뷰

#### 3.4 드래그 앤 드롭 (선택사항)
- 예약 날짜 변경 기능
- API 연동 필요

## 🎨 스타일 커스터마이징

### react-big-calendar CSS 오버라이드

**globals.css**에 추가:
```css
/* react-big-calendar 커스터마이징 */
.rbc-calendar {
  @apply bg-background text-foreground;
}

.rbc-header {
  @apply border-b border-border py-2 text-sm font-semibold;
}

.rbc-day-bg {
  @apply border-r border-b border-border;
}

.rbc-today {
  @apply bg-accent/50;
}

.rbc-off-range-bg {
  @apply bg-muted/30;
}

.rbc-event {
  @apply rounded-md px-2 py-1 text-xs font-semibold;
}

.rbc-event-content {
  @apply truncate;
}

.rbc-toolbar {
  @apply mb-4 flex items-center justify-between;
}

.rbc-toolbar button {
  @apply rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent;
}

.rbc-toolbar button.rbc-active {
  @apply bg-primary text-primary-foreground;
}
```

## 📱 반응형 디자인

### 모바일 최적화
- 캘린더 높이: `h-[400px]` (모바일)
- 이벤트 텍스트: 더 작은 폰트
- 터치 제스처 지원

### 태블릿/데스크톱
- 캘린더 높이: `h-[600px]`
- 더 많은 정보 표시
- 드래그 앤 드롭 지원

## 🔄 데이터 흐름

```
Server Component (page.tsx)
  ↓
getReservationsServer() - 서버 사이드 데이터 fetching
  ↓
Client Component (ReservationCalendarView)
  ↓
react-big-calendar - 캘린더 렌더링
  ↓
이벤트 클릭 → 예약 상세 페이지로 이동
```

## 🚀 구현 단계

### Step 1: 기본 설정 (1-2시간)
1. 의존성 설치
2. ReservationCalendarView 컴포넌트 생성
3. 기본 캘린더 뷰 구현

### Step 2: 스타일링 (1-2시간)
1. CSS 커스터마이징
2. 색상 시스템 적용
3. 반응형 디자인

### Step 3: 기능 통합 (2-3시간)
1. 필터 연동
2. 뷰 전환 기능
3. 이벤트 클릭 핸들러

### Step 4: 고급 기능 (선택사항, 3-4시간)
1. 툴팁 추가
2. 드래그 앤 드롭
3. 성능 최적화

## 📦 필요한 컴포넌트

### shadcn/ui 컴포넌트 추가
```bash
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add tooltip
```

## 🎯 예상 결과

### Before (현재)
- 리스트 형식의 예약 목록
- 날짜별 예약 파악 어려움
- 스크롤이 많아 사용성 저하

### After (개선 후)
- 캘린더 형식의 시각적 표현
- 한 달의 예약 현황을 한눈에 파악
- 날짜 클릭으로 빠른 필터링
- 리스트/캘린더 뷰 전환 가능

## 🔍 추가 개선 아이디어

1. **통계 대시보드**:
   - 월별 예약 통계
   - 방별 예약 현황
   - 수익 그래프

2. **일괄 작업**:
   - 여러 예약 선택
   - 일괄 상태 변경

3. **알림**:
   - 체크인/체크아웃 D-day 알림
   - 예약 취소 알림

4. **내보내기**:
   - 캘린더를 PDF/이미지로 내보내기
   - Excel 내보내기

## 📝 참고 자료

- [react-big-calendar 공식 문서](https://jquense.github.io/react-big-calendar/)
- [date-fns 공식 문서](https://date-fns.org/)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/)

## ✅ 체크리스트

- [ ] react-big-calendar 설치
- [ ] date-fns 설치
- [ ] ReservationCalendarView 컴포넌트 생성
- [ ] CSS 커스터마이징
- [ ] 뷰 전환 기능 구현
- [ ] 필터 연동
- [ ] 반응형 디자인 적용
- [ ] 테스트 및 버그 수정
