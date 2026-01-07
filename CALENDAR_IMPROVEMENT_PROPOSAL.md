# 캘린더 개선 방안 제안 및 구현 완료

## ✅ 구현 완료

**방안 A: 대기/미배정 우선 + 체크인/체크아웃 구분**이 구현되었습니다.

## 📋 개선 전 문제점

1. **하이브리드 방식의 복잡성**: 예약이 많은 날짜에서 상태별 그룹 카운트가 오히려 정보를 헷갈리게 함
2. **체크인/체크아웃 구분 어려움**: 같은 날짜에 체크인하는 인원과 체크아웃하는 인원이 혼재되어 구분이 어려움
3. **대기/미배정 정보 부족**: 관리자가 가장 중요하게 확인해야 할 대기/미배정 정보가 명확하지 않음

## 🎯 개선 목표

1. **대기/미배정 정보 우선 표시**: 관리자가 가장 중요하게 확인해야 할 정보를 명확하게 표시
2. **체크인/체크아웃 명확한 구분**: 시각적으로 체크인과 체크아웃을 쉽게 구분할 수 있도록 개선
3. **단순하고 직관적인 표시**: 복잡한 그룹화 대신 명확하고 간단한 표시 방식

## 💡 제안 방안

### 방안 A: 대기/미배정 우선 + 체크인/체크아웃 구분 (권장)

#### 핵심 아이디어
1. **대기/미배정만 그룹화**: 예약이 많은 날짜에서도 대기/미배정 예약만 "대기: X건" 형태로 그룹 표시
2. **나머지는 개별 표시**: 배정 완료, 체크인, 체크아웃 예약은 개별적으로 표시
3. **체크인/체크아웃 시각적 구분**:
   - 체크인 날짜: 초록색 배경 + "✓ 체크인" 아이콘/텍스트
   - 체크아웃 날짜: 파란색 배경 + "→ 체크아웃" 아이콘/텍스트
   - 체크인과 체크아웃이 같은 날: 두 가지 표시를 함께 (예: "✓ 체크인 → 체크아웃")

#### 구현 세부사항

**1. 이벤트 생성 로직**
```typescript
// 대기/미배정만 그룹화
const isPendingOrUnassigned = reservation.status === 'pending' || !reservation.assignedRoom;
const shouldGroup = isPendingOrUnassigned && dateReservations.filter(r => 
  r.status === 'pending' || !r.assignedRoom
).length > 3; // 3개 이상이면 그룹화

if (shouldGroup) {
  // 대기/미배정 그룹 이벤트 생성
  const pendingCount = dateReservations.filter(r => 
    r.status === 'pending' || !r.assignedRoom
  ).length;
  // "대기: X건" 또는 "미배정: X건" 표시
} else {
  // 개별 이벤트 생성
  // 체크인/체크아웃 정보 포함
}
```

**2. 체크인/체크아웃 구분 표시**
```typescript
// 이벤트 제목에 체크인/체크아웃 정보 포함
const isCheckinDay = isSameDay(checkin, currentDate);
const isCheckoutDay = isSameDay(checkout, currentDate);

let title = reservation.guestName;
if (isCheckinDay && isCheckoutDay) {
  title = `✓→ ${title}`; // 체크인과 체크아웃이 같은 날
} else if (isCheckinDay) {
  title = `✓ ${title}`; // 체크인 날
} else if (isCheckoutDay) {
  title = `→ ${title}`; // 체크아웃 날
}
```

**3. 색상 및 스타일**
- **대기/미배정 그룹**: 회색 배경 (`#6B7280`)
- **체크인 날**: 초록색 배경 (`#059669`) + "✓" 아이콘
- **체크아웃 날**: 파란색 배경 (`#2563EB`) + "→" 아이콘
- **체크인+체크아웃 같은 날**: 보라색 배경 (`#7C3AED`) + "✓→" 아이콘
- **배정 완료**: 기본 파란색 (`#2563EB`)

**4. 이벤트 표시 예시**
```
[대기: 5건]                    // 그룹화 (회색)
✓ 김철수 (A1)                  // 체크인 (초록색)
→ 이영희 (A2)                  // 체크아웃 (파란색)
✓→ 박민수 (A3)                 // 체크인+체크아웃 (보라색)
정수진 (A4)                    // 일반 (파란색)
```

### 방안 B: 탭 기반 필터링 + 날짜별 상세 정보

#### 핵심 아이디어
1. **캘린더 상단에 필터 탭**: 전체 / 체크인 / 체크아웃 / 대기 / 미배정
2. **날짜별 상세 정보**: 각 날짜 셀에 체크인/체크아웃 개수 표시
3. **개별 예약 표시**: 모든 예약을 개별적으로 표시하되, 체크인/체크아웃 정보 포함

#### 구현 세부사항

**1. 필터 탭**
```typescript
<Tabs>
  <TabsTrigger value="all">전체</TabsTrigger>
  <TabsTrigger value="checkin">체크인</TabsTrigger>
  <TabsTrigger value="checkout">체크아웃</TabsTrigger>
  <TabsTrigger value="pending">대기</TabsTrigger>
  <TabsTrigger value="unassigned">미배정</TabsTrigger>
</Tabs>
```

**2. 날짜별 요약 정보**
```typescript
// 각 날짜 셀에 작은 배지로 표시
<div className="date-cell">
  <div className="date-number">7</div>
  <div className="date-summary">
    <Badge>체크인: 3</Badge>
    <Badge>체크아웃: 2</Badge>
    <Badge>대기: 5</Badge>
  </div>
</div>
```

### 방안 C: 레이어드 표시 방식

#### 핵심 아이디어
1. **첫 번째 레이어**: 대기/미배정 그룹 (항상 최상단)
2. **두 번째 레이어**: 체크인 예약 (초록색)
3. **세 번째 레이어**: 체크아웃 예약 (파란색)
4. **네 번째 레이어**: 일반 예약 (기본 색상)

#### 구현 세부사항

**1. 레이어 순서**
```typescript
const events = [
  ...pendingGroupEvents,    // 최상단 (회색)
  ...checkinEvents,         // 체크인 (초록색)
  ...checkoutEvents,        // 체크아웃 (파란색)
  ...normalEvents,          // 일반 (파란색)
];
```

**2. z-index 및 위치 조정**
```css
.pending-group { z-index: 4; }
.checkin-event { z-index: 3; }
.checkout-event { z-index: 2; }
.normal-event { z-index: 1; }
```

## 🎨 UI/UX 개선 사항

### 1. 아이콘 추가
- 체크인: `CheckIn` 또는 `✓` 아이콘
- 체크아웃: `CheckOut` 또는 `→` 아이콘
- 대기: `Clock` 또는 `⏳` 아이콘
- 미배정: `AlertCircle` 또는 `⚠️` 아이콘

### 2. 툴팁 개선
- 이벤트에 마우스 오버 시 상세 정보 표시
- 체크인/체크아웃 날짜 명시
- 방 배정 상태 표시

### 3. 모달 개선
- 날짜 클릭 시 모달에서 체크인/체크아웃 탭으로 분리
- 체크인 목록과 체크아웃 목록을 별도로 표시

## 📊 비교표

| 항목 | 방안 A (권장) | 방안 B | 방안 C |
|------|--------------|--------|--------|
| **대기/미배정 표시** | ✅ 그룹화 | ✅ 필터링 | ✅ 그룹화 |
| **체크인/체크아웃 구분** | ✅ 명확 (아이콘+색상) | ✅ 필터링 | ✅ 레이어 분리 |
| **구현 복잡도** | 중간 | 높음 | 높음 |
| **가독성** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **성능** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## ✅ 구현 완료 사항

### Phase 1: 기본 개선 (완료)
1. ✅ **대기/미배정만 그룹화**: 3개 이상일 때만 "대기: X건" 또는 "미배정: X건" 형태로 그룹 표시
2. ✅ **체크인/체크아웃 아이콘 추가**: 
   - 체크인: `✓` 아이콘 + 초록색 배경
   - 체크아웃: `→` 아이콘 + 파란색 배경
   - 체크인+체크아웃: `✓→` 아이콘 + 보라색 배경
3. ✅ **색상 구분 강화**: 체크인/체크아웃 날짜에 따라 색상 자동 변경
4. ✅ **모달 개선**: 모든 탭에서 체크인/체크아웃 배지 표시

### 구현 세부사항

**1. 그룹화 로직**
- 대기/미배정 예약만 3개 이상일 때 그룹화
- 미배정이 있으면 "미배정: X건" 우선 표시
- 나머지 예약은 모두 개별 표시

**2. 체크인/체크아웃 표시**
- 이벤트 제목에 `✓`, `→`, `✓→` 접두사 추가
- 색상 자동 변경:
  - 체크인 날: 초록색 (`#059669`)
  - 체크아웃 날: 파란색 (`#2563EB`)
  - 체크인+체크아웃: 보라색 (`#7C3AED`)
- 모달에서도 배지로 표시

**3. 이벤트 표시 예시**
```
[대기: 5건]                    // 그룹화 (회색)
[미배정: 3건]                  // 그룹화 (회색)
✓ 김철수 (A1)                  // 체크인 (초록색)
→ 이영희 (A2)                  // 체크아웃 (파란색)
✓→ 박민수 (A3)                 // 체크인+체크아웃 (보라색)
정수진 (A4)                    // 일반 (파란색)
```

## 💻 구현 예시 코드

### 이벤트 생성 로직 수정
```typescript
// 대기/미배정만 그룹화
const pendingReservations = dateReservations.filter(r => 
  r.status === 'pending' || !r.assignedRoom
);

if (pendingReservations.length > 3) {
  // 대기/미배정 그룹 이벤트 생성
  const pendingCount = pendingReservations.length;
  const unassignedCount = pendingReservations.filter(r => !r.assignedRoom).length;
  
  if (unassignedCount > 0) {
    // "미배정: X건" 표시
  } else {
    // "대기: X건" 표시
  }
} else {
  // 개별 이벤트 생성
  // 체크인/체크아웃 정보 포함
}
```

### 체크인/체크아웃 표시
```typescript
const getEventTitle = (reservation: Reservation, date: Date) => {
  const checkin = new Date(reservation.checkin);
  const checkout = new Date(reservation.checkout);
  const isCheckinDay = isSameDay(checkin, date);
  const isCheckoutDay = isSameDay(checkout, date);
  
  let prefix = '';
  if (isCheckinDay && isCheckoutDay) {
    prefix = '✓→ '; // 체크인+체크아웃
  } else if (isCheckinDay) {
    prefix = '✓ '; // 체크인
  } else if (isCheckoutDay) {
    prefix = '→ '; // 체크아웃
  }
  
  return `${prefix}${reservation.guestName}${reservation.assignedRoom ? ` (${reservation.assignedRoom})` : ' (미)'}`;
};
```

## ✅ 기대 효과

1. **명확한 정보 전달**: 대기/미배정 정보가 우선적으로 표시되어 관리 효율성 향상
2. **체크인/체크아웃 구분 용이**: 시각적 구분으로 혼란 최소화
3. **단순한 UI**: 복잡한 그룹화 제거로 가독성 향상
4. **빠른 의사결정**: 필요한 정보를 빠르게 파악 가능
