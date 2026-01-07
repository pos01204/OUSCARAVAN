# 캘린더 UX/UI 개선안

## 📋 현재 문제점

### 1. 가독성 문제
- 한 날짜에 10개 이상의 예약이 표시될 때 가독성이 떨어짐
- 예약 항목이 작은 텍스트로 겹쳐서 표시됨
- "+X개 더 보기" 링크가 많아져서 실제 예약 정보 파악이 어려움

### 2. 필터 영역 과다
- 필터 섹션이 큰 카드 형태로 많은 공간 차지
- 실무에서는 빠른 필터링이 중요하지만 현재는 클릭이 많음

### 3. 정보 밀도 부족
- 캘린더 셀에서 예약의 핵심 정보(상태, 방 배정 여부)를 한눈에 파악하기 어려움
- 색상 구분이 있지만 시각적 강도가 약함

## 🎯 개선 목표

1. **가독성 향상**: 한 날짜에 많은 예약이 있어도 핵심 정보를 빠르게 파악
2. **공간 효율성**: 필터 영역 축소 및 간소화
3. **실무 편의성**: 자주 사용하는 필터를 빠르게 접근
4. **시각적 계층**: 중요 정보를 강조하고 부가 정보는 축소

## 💡 개선안

### 1. 필터 영역 간소화

#### 현재 구조
```
┌─────────────────────────────────────┐
│ 필터                                │
│ 예약 목록을 필터링하세요.            │
│                                     │
│ [검색 입력] [상태 드롭다운]          │
│ [체크인 날짜] [체크아웃 날짜]        │
│ [적용] [초기화]                     │
└─────────────────────────────────────┘
```

#### 개선안: 컴팩트 필터 바
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 [검색]  │ 상태: [전체 ▼]  │ 📅 체크인: [날짜]  │ 📅 체크아웃: [날짜]  │ [적용] [초기화] │
└─────────────────────────────────────────────────────────────┘
```

**구현 방안:**
- 한 줄로 배치하여 공간 절약
- 아이콘으로 시각적 구분
- 드롭다운과 날짜 선택기를 인라인으로 배치
- 반응형: 모바일에서는 세로 배치

**코드 구조:**
```tsx
<div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-md border">
  <div className="flex items-center gap-2">
    <Search className="h-4 w-4 text-muted-foreground" />
    <Input placeholder="예약자명, 예약번호..." className="w-48" />
  </div>
  <Select value={status} onValueChange={setStatus}>
    <SelectTrigger className="w-32">
      <SelectValue placeholder="상태" />
    </SelectTrigger>
  </Select>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-40">
        <CalendarIcon className="mr-2 h-4 w-4" />
        체크인: {checkin || '선택'}
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <Calendar mode="single" selected={checkinDate} onSelect={setCheckinDate} />
    </PopoverContent>
  </Popover>
  {/* 체크아웃도 동일 */}
  <Button onClick={handleApply}>적용</Button>
  <Button variant="ghost" onClick={handleReset}>초기화</Button>
</div>
```

### 2. 캘린더 셀 개선

#### 현재 문제
- 예약이 많을 때 텍스트가 겹쳐서 읽기 어려움
- 상태 정보가 텍스트로만 표시됨
- 방 배정 여부를 파악하기 어려움

#### 개선안 A: 예약 카운트 + 색상 강화

**핵심 아이디어:**
- 예약이 3개 이하: 개별 표시
- 예약이 4개 이상: 카운트 표시 + 색상 그라데이션

```
┌─────────────────┐
│ 7               │
│ ┌─────────────┐ │
│ │ 김*정 (A1)  │ │  ← 3개 이하: 개별 표시
│ │ 이*수 (미)  │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ 🔵 12건     │ │  ← 4개 이상: 카운트 + 색상
│ └─────────────┘ │
└─────────────────┘
```

**구현:**
```tsx
// 예약이 3개 이하인 경우
{reservations.slice(0, 3).map((r, i) => (
  <div key={r.id} className="text-xs p-1 rounded mb-1" style={{ backgroundColor: getStatusColor(r.status) }}>
    {r.guestName} {r.assignedRoom ? `(${r.assignedRoom})` : '(미)'}
  </div>
))}

// 예약이 4개 이상인 경우
{reservations.length > 3 && (
  <div className="text-xs p-1 rounded font-semibold text-white" 
       style={{ 
         background: `linear-gradient(135deg, ${getStatusColor('assigned')} 0%, ${getStatusColor('pending')} 100%)`,
         opacity: Math.min(0.9, 0.5 + (reservations.length / 20))
       }}>
    {reservations.length}건
  </div>
)}
```

#### 개선안 B: 상태별 점 표시 + 호버 상세

**핵심 아이디어:**
- 각 예약을 작은 점으로 표시
- 점의 색상으로 상태 구분
- 호버 시 툴팁으로 상세 정보 표시

```
┌─────────────────┐
│ 7               │
│                 │
│ 🔵🔵🔵🔵🔵      │  ← 상태별 점 표시
│ 🟢🟢            │
│ 🟡              │
│                 │
│ 총 8건          │
└─────────────────┘
```

**구현:**
```tsx
// 상태별 그룹화
const groupedByStatus = reservations.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

<div className="flex flex-wrap gap-1">
  {Object.entries(groupedByStatus).map(([status, count]) => (
    <Tooltip key={status}>
      <TooltipTrigger>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(status) }} />
      </TooltipTrigger>
      <TooltipContent>
        {getStatusLabel(status)}: {count}건
      </TooltipContent>
    </Tooltip>
  ))}
</div>
<div className="text-xs text-muted-foreground mt-1">
  총 {reservations.length}건
</div>
```

#### 개선안 C: 하이브리드 방식 (권장)

**핵심 아이디어:**
- 예약이 5개 이하: 간결한 개별 표시 (이름 + 방/미배정)
- 예약이 6개 이상: 상태별 그룹 카운트 + 색상 강화
- 클릭 시 모달에서 전체 목록 확인

```
┌─────────────────┐
│ 7               │
│ ┌─────────────┐ │
│ │ 김*정 (A1)  │ │  ← 5개 이하: 개별 표시
│ │ 이*수 (미)  │ │
│ │ 박*영 (B1)  │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ 배정: 8건   │ │  ← 6개 이상: 그룹 카운트
│ │ 대기: 2건   │ │
│ └─────────────┘ │
└─────────────────┘
```

### 3. 시각적 개선

#### 색상 시스템 강화

**현재:**
- 상태별 색상이 있지만 시각적 강도가 약함

**개선:**
- 배정 완료: 진한 파란색 (#2563EB)
- 대기: 회색 (#6B7280)
- 체크인: 진한 초록색 (#059669)
- 체크아웃: 보라색 (#7C3AED)
- 취소: 빨간색 (#DC2626)

**구현:**
```tsx
const statusColors = {
  pending: { bg: '#6B7280', text: 'white', label: '대기' },
  assigned: { bg: '#2563EB', text: 'white', label: '배정' },
  checked_in: { bg: '#059669', text: 'white', label: '체크인' },
  checked_out: { bg: '#7C3AED', text: 'white', label: '체크아웃' },
  cancelled: { bg: '#DC2626', text: 'white', label: '취소' },
};
```

#### 아이콘 추가

- 방 배정됨: 🏠 아이콘
- 미배정: ⚠️ 아이콘
- 체크인일: ✅ 아이콘
- 체크아웃일: 🚪 아이콘

### 4. 모달 개선

#### 현재 모달
- 기본적인 예약 정보만 표시
- 스크롤이 길어질 수 있음

#### 개선안: 탭 분리 + 빠른 액션

```
┌─────────────────────────────────────┐
│ 2026년 1월 7일 (수) 예약 목록        │
│ 총 12건의 예약이 있습니다.           │
├─────────────────────────────────────┤
│ [전체(12)] [배정(8)] [대기(4)]      │  ← 탭으로 필터링
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 김*정 (A1)  [배정 완료]         │ │
│ │ 체크인: 2026-01-07              │ │
│ │ [상세 보기] [방 변경]           │ │  ← 빠른 액션
│ └─────────────────────────────────┘ │
│ ...                                │
└─────────────────────────────────────┘
```

**구현:**
```tsx
<Tabs defaultValue="all">
  <TabsList>
    <TabsTrigger value="all">전체({allCount})</TabsTrigger>
    <TabsTrigger value="assigned">배정({assignedCount})</TabsTrigger>
    <TabsTrigger value="pending">대기({pendingCount})</TabsTrigger>
  </TabsList>
  <TabsContent>
    {filteredReservations.map(r => (
      <Card>
        <CardContent>
          <div className="flex justify-between">
            <div>
              <h4>{r.guestName}</h4>
              <p>{r.assignedRoom || '미배정'}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => viewDetail(r.id)}>상세</Button>
              {!r.assignedRoom && (
                <Button size="sm" variant="outline" onClick={() => assignRoom(r.id)}>배정</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </TabsContent>
</Tabs>
```

### 5. 빠른 필터 추가

#### 실무에서 자주 사용하는 필터
- 오늘 체크인
- 오늘 체크아웃
- 미배정만
- 이번 주 예약

**구현:**
```tsx
<div className="flex gap-2 mb-2">
  <Button variant="outline" size="sm" onClick={() => setQuickFilter('today_checkin')}>
    오늘 체크인
  </Button>
  <Button variant="outline" size="sm" onClick={() => setQuickFilter('today_checkout')}>
    오늘 체크아웃
  </Button>
  <Button variant="outline" size="sm" onClick={() => setQuickFilter('unassigned')}>
    미배정만
  </Button>
  <Button variant="outline" size="sm" onClick={() => setQuickFilter('this_week')}>
    이번 주
  </Button>
</div>
```

### 6. 반응형 개선

#### 모바일 최적화
- 필터 바를 세로 배치
- 캘린더 셀의 예약 표시를 더 간결하게
- 모달을 전체 화면으로 표시

## 📐 레이아웃 구조

### 개선된 전체 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 예약 관리                                                    │
│ 예약 목록 및 관리                                            │
├─────────────────────────────────────────────────────────────┤
│ [빠른 필터] [오늘 체크인] [오늘 체크아웃] [미배정만] [이번 주] │
├─────────────────────────────────────────────────────────────┤
│ 🔍 [검색] │ 상태: [전체 ▼] │ 📅 체크인 │ 📅 체크아웃 │ [적용] [초기화] │
├─────────────────────────────────────────────────────────────┤
│ [캘린더] [리스트]                                           │
├─────────────────────────────────────────────────────────────┤
│                    캘린더 영역                              │
│  (개선된 셀 표시)                                           │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 디자인 가이드

### 색상 팔레트
```css
--status-pending: #6B7280;    /* 회색 */
--status-assigned: #2563EB;   /* 파란색 */
--status-checked-in: #059669; /* 초록색 */
--status-checked-out: #7C3AED; /* 보라색 */
--status-cancelled: #DC2626;  /* 빨간색 */
```

### 타이포그래피
- 예약 이름: `text-sm font-semibold`
- 방 정보: `text-xs text-muted-foreground`
- 카운트: `text-xs font-bold`

### 간격
- 필터 바: `p-3 gap-2`
- 캘린더 셀 내부: `p-1 gap-1`
- 모달 카드: `p-4 gap-3`

## 🚀 구현 우선순위

### Phase 1: 필수 개선 (1주)
1. ✅ 필터 영역 간소화 (한 줄 배치)
2. ✅ 캘린더 셀 개선 (하이브리드 방식)
3. ✅ 색상 시스템 강화

### Phase 2: 편의 기능 (1주)
4. ✅ 빠른 필터 추가
5. ✅ 모달 탭 분리
6. ✅ 빠른 액션 버튼

### Phase 3: 고급 기능 (선택)
7. ⚪ 드래그 앤 드롭으로 방 배정
8. ⚪ 일괄 작업 기능
9. ⚪ 예약 통계 대시보드

## 📝 코드 예시

### 개선된 캘린더 셀 컴포넌트

```tsx
function CalendarCell({ date, reservations }: { date: Date; reservations: Reservation[] }) {
  const MAX_VISIBLE = 5;
  const visibleReservations = reservations.slice(0, MAX_VISIBLE);
  const remainingCount = Math.max(0, reservations.length - MAX_VISIBLE);
  
  // 상태별 그룹화
  const statusGroups = useMemo(() => {
    return reservations.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [reservations]);
  
  return (
    <div className="p-1">
      <div className="text-sm font-semibold mb-1">{format(date, 'd')}</div>
      
      {reservations.length <= MAX_VISIBLE ? (
        // 개별 표시
        <div className="space-y-0.5">
          {visibleReservations.map(r => (
            <div
              key={r.id}
              className="text-xs p-0.5 rounded truncate"
              style={{
                backgroundColor: statusColors[r.status].bg,
                color: statusColors[r.status].text,
              }}
              title={`${r.guestName} ${r.assignedRoom || '미배정'}`}
            >
              {r.guestName} {r.assignedRoom ? `(${r.assignedRoom})` : '(미)'}
            </div>
          ))}
        </div>
      ) : (
        // 그룹 카운트 표시
        <div className="space-y-0.5">
          {Object.entries(statusGroups).map(([status, count]) => (
            <div
              key={status}
              className="text-xs p-0.5 rounded font-semibold text-center"
              style={{
                backgroundColor: statusColors[status].bg,
                color: statusColors[status].text,
              }}
            >
              {statusColors[status].label}: {count}건
            </div>
          ))}
          <div className="text-xs text-center text-muted-foreground mt-1">
            총 {reservations.length}건
          </div>
        </div>
      )}
    </div>
  );
}
```

### 개선된 필터 바

```tsx
function CompactFilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-md border mb-4">
      {/* 빠른 필터 */}
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={() => setQuickFilter('today_checkin')}>
          오늘 체크인
        </Button>
        <Button variant="outline" size="sm" onClick={() => setQuickFilter('today_checkout')}>
          오늘 체크아웃
        </Button>
        <Button variant="outline" size="sm" onClick={() => setQuickFilter('unassigned')}>
          미배정만
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* 상세 필터 */}
      <div className="flex items-center gap-2 flex-1">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="예약자명, 예약번호..."
          className="w-48"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">대기</SelectItem>
            <SelectItem value="assigned">배정 완료</SelectItem>
            <SelectItem value="checked_in">체크인</SelectItem>
            <SelectItem value="checked_out">체크아웃</SelectItem>
            <SelectItem value="cancelled">취소</SelectItem>
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-40">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkin ? format(new Date(checkin), 'yyyy-MM-dd') : '체크인'}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={checkinDate}
              onSelect={setCheckinDate}
            />
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-40">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkout ? format(new Date(checkout), 'yyyy-MM-dd') : '체크아웃'}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={checkoutDate}
              onSelect={setCheckoutDate}
            />
          </PopoverContent>
        </Popover>
        
        <Button onClick={handleApply}>적용</Button>
        <Button variant="ghost" onClick={handleReset}>초기화</Button>
      </div>
    </div>
  );
}
```

## 📊 예상 효과

### 가독성
- **Before**: 한 날짜에 10개 예약 시 텍스트 겹침, 정보 파악 어려움
- **After**: 상태별 그룹 카운트로 한눈에 파악 가능

### 공간 효율성
- **Before**: 필터 영역이 약 200px 높이
- **After**: 필터 영역이 약 60px 높이 (70% 절약)

### 사용성
- **Before**: 필터 적용에 3-4번 클릭
- **After**: 빠른 필터로 1번 클릭

### 실무 효율성
- 자주 사용하는 필터를 빠르게 접근
- 예약 상태를 색상으로 즉시 파악
- 모달에서 빠른 액션으로 작업 시간 단축

## 🔄 마이그레이션 계획

1. **기존 기능 유지**: 모든 기존 기능은 그대로 유지
2. **점진적 개선**: Phase별로 단계적 적용
3. **사용자 피드백**: 각 Phase 후 사용자 피드백 수집
4. **A/B 테스트**: 필요시 개선 전후 비교 테스트

## 📚 참고 자료

- [react-big-calendar 커스터마이징](https://jquense.github.io/react-big-calendar/examples/index.html)
- [Shadcn UI 컴포넌트](https://ui.shadcn.com/)
- [Tailwind CSS 유틸리티](https://tailwindcss.com/docs)
