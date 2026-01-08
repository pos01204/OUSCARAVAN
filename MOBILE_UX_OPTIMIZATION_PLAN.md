# 모바일 UI/UX 최적화 기획서

## 📋 개요

현재 OUSCARAVAN 예약 관리 시스템의 모바일 사용자 경험을 전면적으로 개선하기 위한 종합 기획서입니다. 가독성, 직관성, 기능성을 향상시켜 모바일 환경에서의 사용성을 극대화합니다.

**작성일**: 2025-01-15  
**대상**: 관리자 페이지, 고객 페이지 전체  
**우선순위**: 높음

---

## 🔍 현재 문제점 분석

### 1. 캘린더 뷰 (Calendar View)

#### 문제점
- **가독성 저하**: 날짜별 정보가 너무 작고, "+2개 더" 같은 텍스트가 모바일에서 읽기 어려움
- **터치 영역 부족**: 날짜 셀과 이벤트가 작아서 정확한 터치가 어려움
- **정보 밀도 과다**: 한 셀에 여러 정보가 겹쳐 표시되어 혼란스러움
- **색상 구분 미흡**: 미배정/체크인/체크아웃 구분이 모바일에서 명확하지 않음
- **모달 접근성**: 모달이 화면을 가득 채워 스크롤이 어려움

#### 현재 구현
```typescript
// ReservationCalendarView.tsx
<div className="h-[500px] md:h-[600px] mt-4 rounded-lg border">
  <Calendar
    events={events}
    view={view}
    // 모바일에서 월간 뷰만 허용
    views={['month', 'week', 'day', 'agenda']}
  />
</div>
```

### 2. 필터 영역 (Filter Area)

#### 문제점
- **레이아웃 과밀**: 빠른 필터 버튼 4개 + 검색 + 드롭다운 2개 + 날짜 입력 2개 + 버튼 2개가 한 화면에 배치
- **모바일 가로 스크롤**: 필터 바가 화면 너비를 초과하여 가로 스크롤 발생
- **터치 타겟 작음**: 버튼과 입력 필드가 모바일 터치 최소 크기(44x44px) 미만
- **접근성 부족**: 필터 상태가 시각적으로 명확하지 않음

#### 현재 구현
```typescript
// ReservationFiltersClient.tsx
<div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30">
  {/* 빠른 필터 4개 */}
  {/* 검색 + 드롭다운 + 날짜 입력 + 버튼 */}
</div>
```

### 3. 리스트 뷰 (List View)

#### 문제점
- **일정 뷰 복잡성**: 시간대별 표시가 모바일에서 너무 세밀하여 스크롤이 많음
- **카드 정보 과다**: 한 카드에 너무 많은 정보가 표시되어 핵심 정보 파악 어려움
- **액션 버튼 접근성**: 상세보기 버튼이 작고 위치가 불명확함

### 4. 네비게이션 (Navigation)

#### 문제점
- **하단 네비게이션 겹침**: 브라우저 네비게이션 바와 앱 하단 네비게이션이 겹쳐 보임
- **상단 헤더 공간 낭비**: 모바일에서 상단 헤더가 너무 많은 공간 차지
- **뷰 전환 불편**: 캘린더/리스트 전환이 상단에만 있어 접근이 어려움

### 5. 터치 인터랙션 (Touch Interaction)

#### 문제점
- **터치 타겟 크기**: 많은 버튼이 44x44px 미만
- **제스처 미지원**: 스와이프, 롱 프레스 등 모바일 제스처 미지원
- **피드백 부족**: 터치 시 시각적/햅틱 피드백 부족

### 6. 성능 (Performance)

#### 문제점
- **렌더링 지연**: 캘린더 뷰에서 많은 예약 데이터 렌더링 시 지연
- **메모리 사용**: 모달에서 모든 예약 데이터를 한 번에 렌더링

---

## 🎯 개선 목표

### 1. 가독성 향상
- **목표**: 모바일에서 모든 텍스트와 정보를 명확하게 읽을 수 있도록 개선
- **지표**: 텍스트 크기 14px 이상, 색상 대비 4.5:1 이상

### 2. 직관성 향상
- **목표**: 사용자가 기능을 찾지 않고도 자연스럽게 사용할 수 있도록 개선
- **지표**: 주요 기능까지 클릭 수 3회 이하

### 3. 기능성 향상
- **목표**: 모바일에서도 모든 기능을 효율적으로 사용할 수 있도록 개선
- **지표**: 터치 타겟 크기 44x44px 이상, 오류율 5% 이하

### 4. 성능 향상
- **목표**: 모바일에서도 부드러운 스크롤과 빠른 반응 속도
- **지표**: 초기 로딩 2초 이하, 인터랙션 지연 100ms 이하

---

## 🚀 개선 방안

## Phase 1: 캘린더 뷰 최적화

### 1.1 모바일 전용 캘린더 레이아웃

#### 개선 내용
- **날짜 셀 크기 확대**: 모바일에서 최소 48x48px 이상
- **이벤트 표시 간소화**: 날짜별로 건수만 표시하고, 상세는 모달에서 확인
- **색상 강화**: 미배정(회색), 체크인(초록), 체크아웃(파랑) 색상을 더 진하게
- **터치 영역 확대**: 전체 날짜 셀을 클릭 가능 영역으로 확대

#### 구현 예시
```typescript
// 모바일 전용 이벤트 컴포넌트
const MobileEventComponent = ({ event }: { event: ReservationEvent }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (!isMobile) return <DefaultEventComponent event={event} />;
  
  return (
    <div 
      className="w-full h-full flex items-center justify-center text-xs font-bold"
      style={{
        backgroundColor: STATUS_COLORS[event.resource.status].bg,
        color: STATUS_COLORS[event.resource.status].text,
        minHeight: '32px', // 터치 영역 확보
      }}
    >
      {event.title}
    </div>
  );
};
```

#### CSS 개선
```css
/* 모바일 캘린더 셀 크기 확대 */
@media (max-width: 768px) {
  .rbc-day-bg {
    min-height: 60px; /* 모바일에서 최소 높이 확보 */
  }
  
  .rbc-date-cell {
    font-size: 16px; /* 날짜 숫자 크기 확대 */
    font-weight: 600;
  }
  
  .rbc-event {
    min-height: 28px; /* 터치 영역 확보 */
    font-size: 11px;
    padding: 4px 6px;
  }
  
  /* 그룹 카운트 스타일 강화 */
  .rbc-event.rbc-event-grouped {
    font-size: 12px;
    font-weight: 700;
    min-height: 32px;
  }
}
```

### 1.2 모바일 모달 최적화

#### 개선 내용
- **전체 화면 모달**: 모바일에서 모달을 전체 화면으로 표시
- **하단 시트 패턴**: iOS/Android 네이티브 앱처럼 하단에서 올라오는 시트 형태
- **스와이프 닫기**: 아래로 스와이프하여 모달 닫기
- **고정 헤더**: 모달 내 헤더를 고정하고 콘텐츠만 스크롤

#### 구현 예시
```typescript
// 모바일 최적화 모달
<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent className="md:max-w-2xl max-h-[90vh] md:max-h-[80vh] p-0">
    {/* 모바일: 전체 화면, 데스크톱: 중앙 모달 */}
    <div className="flex flex-col h-full md:h-auto">
      {/* 고정 헤더 */}
      <DialogHeader className="px-4 py-3 border-b sticky top-0 bg-background z-10">
        <DialogTitle className="text-lg font-semibold">
          {selectedDate && format(selectedDate, 'yyyy년 M월 d일', { locale: ko })}
        </DialogTitle>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={() => setIsModalOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </DialogHeader>
      
      {/* 스크롤 가능한 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <Tabs defaultValue="all" className="w-full">
          {/* 탭 내용 */}
        </Tabs>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### 1.3 캘린더 툴바 최적화

#### 개선 내용
- **모바일 간소화**: 모바일에서 불필요한 버튼 숨김
- **뷰 전환 버튼 확대**: 월/주/일/일정 전환 버튼을 더 크고 명확하게
- **날짜 네비게이션 개선**: 이전/다음 버튼을 더 크게, 중앙에 현재 날짜 표시

#### 구현 예시
```typescript
// 모바일 최적화 툴바
const MobileToolbar = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className="rbc-toolbar">
      {isMobile ? (
        // 모바일: 간소화된 툴바
        <div className="flex items-center justify-between w-full px-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('PREV')}
            className="min-w-[60px]"
          >
            이전
          </Button>
          <span className="text-base font-semibold">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </span>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('NEXT')}
            className="min-w-[60px]"
          >
            다음
          </Button>
        </div>
      ) : (
        // 데스크톱: 전체 툴바
        <DefaultToolbar />
      )}
    </div>
  );
};
```

---

## Phase 2: 필터 영역 최적화

### 2.1 접이식 필터 디자인

#### 개선 내용
- **기본 상태**: 빠른 필터 버튼 4개만 표시
- **확장 상태**: "필터 더보기" 버튼 클릭 시 상세 필터 표시
- **모바일 최적화**: 상세 필터를 하단 시트로 표시

#### 구현 예시
```typescript
const MobileFilterSheet = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* 빠른 필터 (항상 표시) */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Button variant="outline" size="sm">오늘 체크인</Button>
        <Button variant="outline" size="sm">오늘 체크아웃</Button>
        <Button variant="outline" size="sm">미배정만</Button>
        <Button variant="outline" size="sm">이번 주</Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="md:hidden"
        >
          <Filter className="h-4 w-4 mr-1" />
          필터
        </Button>
      </div>
      
      {/* 모바일: 하단 시트, 데스크톱: 인라인 */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>필터</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            {/* 검색 */}
            <Input placeholder="예약자명, 예약번호..." />
            {/* 상태 선택 */}
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="상태" />
              </SelectTrigger>
            </Select>
            {/* 날짜 선택 */}
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" placeholder="체크인" />
              <Input type="date" placeholder="체크아웃" />
            </div>
            {/* 적용 버튼 */}
            <Button className="w-full" onClick={handleApply}>
              적용
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
```

### 2.2 활성 필터 표시

#### 개선 내용
- **필터 칩**: 활성화된 필터를 칩 형태로 표시
- **개별 제거**: 각 필터 칩에 X 버튼으로 개별 제거 가능
- **전체 초기화**: "초기화" 버튼으로 모든 필터 한 번에 제거

#### 구현 예시
```typescript
const ActiveFilters = ({ filters, onRemove, onReset }: ActiveFiltersProps) => {
  if (Object.keys(filters).length === 0) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <span className="text-sm text-muted-foreground">적용된 필터:</span>
      {filters.status && (
        <Badge variant="secondary" className="gap-1">
          상태: {filters.status}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => onRemove('status')}
          />
        </Badge>
      )}
      {filters.search && (
        <Badge variant="secondary" className="gap-1">
          검색: {filters.search}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => onRemove('search')}
          />
        </Badge>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="text-xs"
      >
        전체 초기화
      </Button>
    </div>
  );
};
```

---

## Phase 3: 리스트 뷰 최적화

### 3.1 카드 레이아웃 개선

#### 개선 내용
- **핵심 정보 우선**: 예약자명, 날짜, 상태를 상단에 크게 표시
- **접이식 상세**: 상세 정보는 기본적으로 접혀 있고, 탭하여 확장
- **액션 버튼 강조**: 상세보기 버튼을 더 크고 명확하게

#### 구현 예시
```typescript
const MobileReservationCard = ({ reservation }: { reservation: Reservation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card className="mb-3">
      <CardHeader
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-1 truncate">
              {reservation.guestName}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{reservation.checkin}</span>
              <span>→</span>
              <span>{reservation.checkout}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(reservation.status)}
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
          {/* 상세 정보 */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <Label className="text-muted-foreground">예약번호</Label>
              <p className="font-medium">{reservation.reservationNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">배정된 방</Label>
              <p className="font-medium">
                {reservation.assignedRoom || '미배정'}
              </p>
            </div>
          </div>
          
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push(`/admin/reservations/${reservation.id}`)}
          >
            상세보기
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
```

### 3.2 일정 뷰 최적화

#### 개선 내용
- **모바일 간소화**: 모바일에서는 시간대별 상세 표시 제거, 날짜별 그룹만 표시
- **스와이프 네비게이션**: 좌우 스와이프로 날짜 이동
- **인피니트 스크롤**: 날짜별로 무한 스크롤 지원

---

## Phase 4: 네비게이션 최적화

### 4.1 하단 네비게이션 개선

#### 개선 내용
- **고정 위치**: `position: fixed`로 항상 하단에 고정
- **안전 영역 고려**: iPhone의 홈 인디케이터 영역 고려 (`safe-area-inset-bottom`)
- **활성 상태 표시**: 현재 페이지를 명확하게 표시

#### 구현 예시
```css
/* 하단 네비게이션 안전 영역 고려 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: env(safe-area-inset-bottom);
  background: white;
  border-top: 1px solid #e5e7eb;
  z-index: 50;
}
```

### 4.2 상단 헤더 최적화

#### 개선 내용
- **모바일 간소화**: 모바일에서 로고와 메뉴만 표시
- **스크롤 시 숨김**: 스크롤 다운 시 헤더 숨김, 스크롤 업 시 표시
- **뷰 전환 버튼**: 캘린더/리스트 전환 버튼을 헤더에 추가

---

## Phase 5: 터치 인터랙션 개선

### 5.1 터치 타겟 크기

#### 개선 내용
- **최소 크기**: 모든 클릭 가능한 요소를 44x44px 이상으로 확대
- **간격 확보**: 버튼 간 최소 8px 간격 확보
- **피드백 제공**: 터치 시 시각적 피드백 (색상 변화, 애니메이션)

#### CSS 개선
```css
/* 모든 버튼 최소 크기 확보 */
button, .clickable {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* 터치 피드백 */
button:active {
  transform: scale(0.95);
  opacity: 0.8;
  transition: transform 0.1s, opacity 0.1s;
}
```

### 5.2 제스처 지원

#### 개선 내용
- **스와이프**: 좌우 스와이프로 날짜 이동, 아래 스와이프로 모달 닫기
- **풀 투 리프레시**: 리스트 뷰에서 아래로 당겨서 새로고침
- **롱 프레스**: 예약 카드 롱 프레스로 빠른 액션 메뉴 표시

#### 구현 예시
```typescript
// 스와이프 제스처 훅
const useSwipe = (onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };
  
  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};
```

---

## Phase 6: 성능 최적화

### 6.1 가상화 (Virtualization)

#### 개선 내용
- **리스트 가상화**: 많은 예약이 있을 때 가상 스크롤 적용
- **캘린더 렌더링 최적화**: 보이는 날짜만 렌더링

#### 구현 예시
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualizedReservationList = ({ reservations }: Props) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: reservations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // 각 카드 예상 높이
    overscan: 5, // 보이는 영역 외 추가 렌더링
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ReservationCard reservation={reservations[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 6.2 지연 로딩 (Lazy Loading)

#### 개선 내용
- **모달 지연 로딩**: 모달이 열릴 때만 예약 상세 데이터 로딩
- **이미지 지연 로딩**: 필요할 때만 이미지 로딩

### 6.3 메모이제이션

#### 개선 내용
- **React.memo**: 불필요한 리렌더링 방지
- **useMemo/useCallback**: 계산 비용이 큰 작업 메모이제이션

---

## Phase 7: 접근성 개선

### 7.1 ARIA 레이블

#### 개선 내용
- **모든 인터랙티브 요소에 ARIA 레이블 추가**
- **스크린 리더 지원**: 모든 기능을 스크린 리더로 접근 가능하도록

#### 구현 예시
```typescript
<Button
  aria-label="오늘 체크인 예약 필터 적용"
  aria-pressed={isTodayCheckinActive}
>
  오늘 체크인
</Button>
```

### 7.2 키보드 네비게이션

#### 개선 내용
- **모든 기능을 키보드로 접근 가능하도록**
- **포커스 인디케이터 강화**: 현재 포커스 위치를 명확하게 표시

---

## 📊 우선순위 및 구현 계획

### Phase 1 (즉시 구현 - 1주) ✅ 완료 (2025-01-15)
1. ✅ 캘린더 뷰 모바일 최적화
   - 날짜 셀 크기 확대 (60px 최소 높이)
   - 이벤트 표시 간소화 (건수만 표시)
   - 색상 강화 (미배정: #4B5563, 체크인: #047857, 체크아웃: #1D4ED8)
2. ✅ 필터 영역 접이식 디자인
   - 빠른 필터만 기본 표시
   - 상세 필터 하단 시트 (Sheet 컴포넌트 추가)
   - 활성 필터 칩 표시
3. ✅ 터치 타겟 크기 확대
   - 모든 버튼 44x44px 이상
   - 입력 필드 최소 높이 44px
   - 터치 피드백 애니메이션 추가
4. ✅ 모바일 모달 최적화
   - 전체 화면 모달 (모바일)
   - 고정 헤더 및 스크롤 가능한 콘텐츠
   - 데스크톱에서는 기존 중앙 모달 유지

### Phase 2 (단기 - 2주) ✅ 완료 (2025-01-15)
4. ✅ 모바일 모달 최적화 (Phase 1에서 완료)
   - 전체 화면 모달
   - 하단 시트 패턴
   - 스와이프 닫기 (선택사항, 향후 구현)
5. ✅ 리스트 뷰 카드 개선
   - 접이식 상세 정보 (ChevronDown 아이콘으로 확장/축소)
   - 핵심 정보 우선 표시 (예약자명, 날짜, 방 배정)
   - 상세 정보는 확장 시에만 표시
6. ✅ 네비게이션 개선
   - 하단 네비게이션 안전 영역 고려 (`env(safe-area-inset-bottom)`)
   - 상단 헤더 간소화 (모바일: h-14, 텍스트 간소화)
   - 게스트 헤더 모바일 최적화 (로고만 표시)

### Phase 3 (중기 - 3주) ✅ 핵심 작업 완료 (2025-01-15)
7. ⏸️ 제스처 지원 (선택사항, 향후 구현)
   - 스와이프 네비게이션
   - 풀 투 리프레시
8. ⏸️ 성능 최적화 (선택사항, 향후 구현)
   - 리스트 가상화
   - 지연 로딩
9. ✅ 접근성 개선
   - ARIA 레이블 추가 (모든 버튼, 입력 필드, 필터 칩)
   - 키보드 네비게이션 개선 (Enter/Space 키 지원)
   - 포커스 관리 개선

---

## 🎨 디자인 가이드라인

### 색상 시스템

```css
/* 상태별 색상 (모바일 강화) */
--status-unassigned: #6B7280; /* 회색 - 더 진하게 */
--status-checkin: #059669; /* 초록 - 더 진하게 */
--status-checkout: #2563EB; /* 파랑 - 더 진하게 */

/* 터치 피드백 */
--touch-feedback: rgba(0, 0, 0, 0.1);
```

### 타이포그래피

```css
/* 모바일 최소 폰트 크기 */
--font-size-base: 16px; /* 기본 텍스트 */
--font-size-sm: 14px; /* 작은 텍스트 */
--font-size-lg: 18px; /* 큰 텍스트 */
--font-size-xl: 20px; /* 제목 */
```

### 간격 시스템

```css
/* 모바일 간격 */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* 터치 타겟 최소 크기 */
--touch-target-min: 44px;
```

---

## 📱 모바일 특화 기능

### 1. 햅틱 피드백 (선택사항)

```typescript
// 햅틱 피드백 (지원되는 기기에서)
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };
    navigator.vibrate(patterns[type]);
  }
};
```

### 2. PWA 지원 (선택사항)

- **매니페스트 파일**: 앱처럼 설치 가능
- **오프라인 지원**: Service Worker로 오프라인 기능
- **푸시 알림**: 예약 알림 등

---

## 🧪 테스트 계획

### 1. 디바이스 테스트
- **iOS**: iPhone SE, iPhone 12, iPhone 14 Pro Max
- **Android**: Galaxy S21, Pixel 7, Galaxy Fold

### 2. 브라우저 테스트
- **iOS Safari**: 최신 버전
- **Chrome Mobile**: 최신 버전
- **Samsung Internet**: 최신 버전

### 3. 접근성 테스트
- **스크린 리더**: VoiceOver (iOS), TalkBack (Android)
- **키보드 네비게이션**: 모든 기능 테스트
- **색상 대비**: WCAG AA 기준 준수 확인

---

## 📈 성공 지표

### 정량적 지표
- **페이지 로딩 시간**: 2초 이하
- **인터랙션 지연**: 100ms 이하
- **터치 오류율**: 5% 이하
- **접근성 점수**: Lighthouse 90점 이상

### 정성적 지표
- **사용자 만족도**: 설문조사 4.0/5.0 이상
- **학습 곡선**: 신규 사용자 5분 이내 주요 기능 파악
- **오류 복구**: 오류 발생 시 3회 이내 복구

---

## 🔄 지속적 개선

### 1. 사용자 피드백 수집
- **인앱 피드백**: 버튼 클릭으로 피드백 제출
- **정기 설문**: 분기별 사용자 만족도 조사

### 2. 분석 도구
- **Google Analytics**: 사용자 행동 분석
- **Hotjar**: 사용자 세션 녹화 및 히트맵

### 3. A/B 테스트
- **레이아웃 변형**: 다양한 레이아웃 테스트
- **색상 변형**: 색상 조합 테스트

---

## 📝 체크리스트

### Phase 1 체크리스트 ✅ 완료 (2025-01-15)
- [x] 캘린더 날짜 셀 크기 확대 (48x48px 이상)
- [x] 이벤트 표시 간소화 (건수만 표시)
- [x] 색상 강화 (미배정/체크인/체크아웃)
- [x] 필터 접이식 디자인 구현
- [x] 빠른 필터 버튼 4개만 기본 표시
- [x] 상세 필터 하단 시트 구현
- [x] 모든 버튼 터치 타겟 44x44px 이상

### Phase 2 체크리스트 ✅ 완료 (2025-01-15)
- [x] 모바일 전체 화면 모달 구현 (Phase 1에서 완료)
- [x] 하단 시트 패턴 적용 (Phase 1에서 완료)
- [ ] 스와이프 닫기 기능 (선택사항, 향후 구현)
- [x] 리스트 카드 접이식 상세 정보
- [x] 핵심 정보 우선 표시
- [x] 하단 네비게이션 안전 영역 고려
- [x] 상단 헤더 간소화

### Phase 3 체크리스트 ✅ 완료 (2025-01-15)
- [ ] 스와이프 네비게이션 구현 (선택사항, 향후 구현)
- [ ] 풀 투 리프레시 기능 (선택사항, 향후 구현)
- [ ] 리스트 가상화 적용 (선택사항, 향후 구현)
- [ ] 지연 로딩 구현 (선택사항, 향후 구현)
- [x] ARIA 레이블 추가
- [x] 키보드 네비게이션 개선

---

## 🎯 결론

이 기획서는 OUSCARAVAN 예약 관리 시스템의 모바일 사용자 경험을 전면적으로 개선하기 위한 종합적인 방안을 제시합니다. 단계별로 구현하여 점진적으로 사용성을 향상시키고, 지속적인 피드백과 개선을 통해 최적의 모바일 경험을 제공할 수 있습니다.

**다음 단계**: Phase 1부터 시작하여 우선순위에 따라 순차적으로 구현합니다.

---

---

## 📋 구현 완료 내역

### Phase 1 구현 완료 (2025-01-15)

#### 1. 캘린더 뷰 모바일 최적화
- ✅ **날짜 셀 크기 확대**: 모바일에서 최소 60px 높이로 확대하여 터치 영역 확보
- ✅ **이벤트 표시 간소화**: 날짜별로 미배정/체크인/체크아웃 건수만 표시
- ✅ **색상 강화**: 
  - 미배정: `#4B5563` (더 진한 회색)
  - 체크인: `#047857` (더 진한 초록)
  - 체크아웃: `#1D4ED8` (더 진한 파랑)
- ✅ **모바일 모달 최적화**: 전체 화면 모달, 고정 헤더, 스크롤 가능한 콘텐츠

#### 2. 필터 영역 접이식 디자인
- ✅ **빠른 필터 버튼**: 4개 버튼만 기본 표시 (오늘 체크인, 오늘 체크아웃, 미배정만, 이번 주)
- ✅ **상세 필터 하단 시트**: 모바일에서 Sheet 컴포넌트로 하단 시트 구현
- ✅ **활성 필터 칩**: 적용된 필터를 칩 형태로 표시하고 개별 제거 가능
- ✅ **데스크톱 인라인 필터**: 데스크톱에서는 기존 인라인 필터 유지

#### 3. 터치 타겟 크기 확대
- ✅ **모든 버튼**: 최소 44x44px 크기 보장
- ✅ **입력 필드**: 모바일에서 최소 44px 높이, 폰트 크기 16px (iOS 줌 방지)
- ✅ **터치 피드백**: 버튼 클릭 시 scale 애니메이션 추가

#### 4. 추가 개선 사항
- ✅ **Sheet 컴포넌트 추가**: shadcn/ui 스타일의 Sheet 컴포넌트 구현
- ✅ **반응형 디자인**: 모바일/데스크톱 분기 처리
- ✅ **접근성 개선**: 터치 영역 확대로 사용성 향상

### 구현 파일 목록

#### Phase 1
- `components/ui/sheet.tsx` (신규 생성)
- `app/globals.css` (모바일 최적화 CSS 추가)
- `app/admin/reservations/ReservationCalendarView.tsx` (모바일 모달 최적화, 색상 강화)
- `app/admin/reservations/ReservationFiltersClient.tsx` (접이식 필터 디자인)

#### Phase 2
- `app/admin/reservations/ReservationListView.tsx` (접이식 카드 컴포넌트 추가)
- `components/guest/GuestBottomNav.tsx` (안전 영역 추가)
- `components/shared/BottomNav.tsx` (안전 영역 추가)
- `components/guest/GuestHeader.tsx` (모바일 간소화)
- `app/admin/layout.tsx` (모바일 헤더 간소화)
- `app/guest/[token]/layout.tsx` (모바일 헤더 높이 조정)
- `app/globals.css` (안전 영역 및 모바일 헤더 CSS 추가)

#### Phase 3
- `app/admin/reservations/ReservationFiltersClient.tsx` (ARIA 레이블 및 키보드 네비게이션 추가)
- `app/admin/reservations/ReservationListView.tsx` (ARIA 레이블 및 키보드 네비게이션 추가)
- `app/admin/reservations/ReservationCalendarView.tsx` (ARIA 레이블 및 키보드 네비게이션 추가)

### Phase 2 구현 완료 (2025-01-15)

#### 1. 리스트 뷰 카드 개선
- ✅ **접이식 상세 정보**: 카드 헤더 클릭으로 상세 정보 확장/축소
- ✅ **핵심 정보 우선 표시**: 
  - 기본 상태: 예약자명, 체크인/체크아웃 날짜, 방 배정, 상태 배지
  - 확장 시: 예약번호, 상품 정보, 옵션, 결제금액 상세, 상세보기 버튼
- ✅ **ChevronDown 아이콘**: 확장 상태를 시각적으로 표시

#### 2. 네비게이션 최적화
- ✅ **하단 네비게이션 안전 영역**: `env(safe-area-inset-bottom)` 적용
  - iPhone의 홈 인디케이터 영역 고려
  - `GuestBottomNav`, `BottomNav` 컴포넌트에 적용
- ✅ **상단 헤더 간소화**:
  - 모바일: 높이 56px (h-14), 로고만 표시
  - 게스트 헤더: 모바일에서 "OUSCARAVAN" 로고만 표시
  - 관리자 헤더: 모바일에서 "관리자"로 텍스트 간소화
  - 데스크톱: 기존 레이아웃 유지

#### 3. 추가 개선 사항
- ✅ **게스트 레이아웃 조정**: 모바일 헤더 높이(56px) 반영하여 `pt-14` 적용
- ✅ **터치 타겟 유지**: 모든 버튼 44x44px 이상 유지

### Phase 3 구현 완료 (2025-01-15)

#### 1. 접근성 개선 (ARIA 레이블)
- ✅ **필터 버튼**: 모든 빠른 필터 버튼에 `aria-label` 추가
  - "오늘 체크인 예약 필터 적용"
  - "오늘 체크아웃 예약 필터 적용"
  - "미배정 예약만 표시"
  - "이번 주 예약 필터 적용"
- ✅ **필터 시트**: 모바일 필터 시트 버튼에 `aria-label`, `aria-expanded` 추가
- ✅ **입력 필드**: 모든 입력 필드에 `aria-label` 및 `htmlFor` 연결
  - 검색 입력: "예약자명 또는 예약번호로 검색"
  - 상태 선택: "예약 상태 선택"
  - 날짜 입력: "체크인 날짜 선택", "체크아웃 날짜 선택"
- ✅ **필터 칩**: 각 필터 칩의 제거 버튼에 `aria-label` 추가
  - "상태 필터 제거"
  - "검색 필터 제거"
  - "체크인 날짜 필터 제거"
  - "체크아웃 날짜 필터 제거"
- ✅ **모달**: 예약 목록 모달에 `aria-labelledby`, `aria-describedby` 추가
- ✅ **카드**: 리스트 뷰 카드에 `aria-label`, `aria-expanded` 추가
- ✅ **아이콘**: 장식용 아이콘에 `aria-hidden="true"` 추가

#### 2. 키보드 네비게이션 개선
- ✅ **접이식 카드**: Enter/Space 키로 확장/축소 가능
  - `tabIndex={0}` 추가
  - `onKeyDown` 핸들러로 Enter/Space 키 처리
- ✅ **필터 칩 제거**: Enter/Space 키로 필터 제거 가능
  - 각 X 버튼에 `role="button"`, `tabIndex={0}` 추가
  - `onKeyDown` 핸들러로 Enter/Space 키 처리
- ✅ **모달 카드**: Enter/Space 키로 상세 페이지 이동 가능
  - `role="button"`, `tabIndex={0}` 추가
  - `onKeyDown` 핸들러로 Enter/Space 키 처리
- ✅ **검색 입력**: Enter 키로 필터 적용 (기존 기능 유지)

#### 3. 추가 개선 사항
- ✅ **포커스 관리**: 모든 인터랙티브 요소에 적절한 포커스 순서 설정
- ✅ **시맨틱 HTML**: 적절한 HTML 구조 및 역할 속성 사용

### 향후 구현 예정 (선택사항)
- 스와이프 제스처 지원
- 풀 투 리프레시 기능
- 리스트 가상화 (대량 데이터 처리 시)
- 지연 로딩 (이미지 및 모달 콘텐츠)

### 다음 단계
- 사용자 피드백 수집 및 개선
- 성능 모니터링 및 최적화
- 추가 접근성 테스트 (스크린 리더, 키보드 네비게이션)

---

**문서 버전**: 1.1  
**최종 업데이트**: 2025-01-15  
**작성자**: AI Assistant
