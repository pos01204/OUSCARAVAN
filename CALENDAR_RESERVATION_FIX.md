# 캘린더 예약 누락 문제 수정 가이드

## 🔍 발견된 문제

### 1. 예약 데이터 누락
- 캘린더에서 일부 예약이 표시되지 않음
- 필터가 적용되면 예약이 누락됨
- 날짜 범위에 포함된 예약이 제대로 표시되지 않음

### 2. 날짜 비교 로직 문제
- 시간 부분이 날짜 비교에 영향을 줌
- 체크인/체크아웃 날짜 범위 계산이 부정확함

### 3. 데이터 로딩 문제
- 필터가 적용되면 일부 예약이 서버에서 제외됨
- 캘린더는 모든 예약을 표시해야 하는데 필터링된 데이터만 받음

## ✅ 수정 사항

### 1. 예약 데이터 로딩 개선 (`app/admin/reservations/page.tsx`)

**문제:**
- 필터가 적용되면 일부 예약이 서버에서 제외됨
- 캘린더는 모든 예약을 표시해야 함

**수정:**
```typescript
// 캘린더를 위해 필터 없이 모든 예약 조회 (limit을 크게 설정)
const data = await getReservationsServer({
  status: status && status !== 'all' ? status : undefined,
  // checkin, checkout 필터는 리스트 뷰에서만 사용
  // 캘린더는 모든 예약을 표시해야 하므로 필터 제거
  search,
  limit: 1000, // 충분히 큰 값으로 설정하여 모든 예약 가져오기
});
```

### 2. 캘린더 이벤트 생성 로직 개선 (`app/admin/reservations/ReservationCalendarView.tsx`)

**문제:**
- 날짜 비교 시 시간 부분이 영향을 줌
- 체크아웃 날짜가 제대로 포함되지 않음

**수정:**
```typescript
// 체크인 날짜 (시작일) - 날짜만 사용 (시간 제거)
const checkinDate = new Date(reservation.checkin);
const startDate = new Date(checkinDate.getFullYear(), checkinDate.getMonth(), checkinDate.getDate());
startDate.setHours(0, 0, 0, 0); // 자정으로 설정

// 체크아웃 날짜 (종료일) - 체크아웃 날짜 포함 (하루 종일 표시)
const checkoutDate = new Date(reservation.checkout);
const endDate = new Date(checkoutDate.getFullYear(), checkoutDate.getMonth(), checkoutDate.getDate());
endDate.setHours(23, 59, 59, 999); // 해당 날짜의 마지막 시간으로 설정
```

### 3. 날짜 필터링 로직 개선 (`getReservationsForDate`)

**문제:**
- 날짜 비교 시 시간 부분이 영향을 줌
- `isSameDay`와 범위 비교가 혼재되어 있음

**수정:**
```typescript
// 날짜만 비교하기 위해 시간 부분 제거
const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
targetDate.setHours(0, 0, 0, 0);

const filtered = reservations.filter((reservation) => {
  // 체크인 날짜 (시간 제거)
  const checkin = new Date(reservation.checkin);
  const checkinDate = new Date(checkin.getFullYear(), checkin.getMonth(), checkin.getDate());
  checkinDate.setHours(0, 0, 0, 0);
  
  // 체크아웃 날짜 (시간 제거)
  const checkout = new Date(reservation.checkout);
  const checkoutDate = new Date(checkout.getFullYear(), checkout.getMonth(), checkout.getDate());
  checkoutDate.setHours(0, 0, 0, 0);
  
  // 날짜 범위 확인: 체크인 <= 선택일 <= 체크아웃
  return checkinDate <= targetDate && targetDate <= checkoutDate;
});
```

### 4. 뷰별 필터링 분리 (`app/admin/reservations/ReservationsViewClient.tsx`)

**문제:**
- 캘린더와 리스트 뷰가 같은 필터를 사용함
- 캘린더는 모든 예약을 표시해야 함

**수정:**
```typescript
// 리스트 뷰용 필터링된 예약 목록
const filteredReservations = useMemo(() => {
  if (view === 'calendar') {
    // 캘린더 뷰는 모든 예약 표시
    return reservations;
  }
  
  // 리스트 뷰는 필터 적용
  let filtered = [...reservations];
  
  // 상태, 체크인, 체크아웃, 검색 필터 적용
  // ...
  
  return filtered;
}, [reservations, view, status, checkin, checkout, search]);
```

### 5. 디버깅 로그 추가

**추가된 로그:**
- 예약 처리 개수
- 유효한 예약 개수
- 생성된 이벤트 개수
- 날짜별 예약 필터링 결과

```typescript
console.log('[Calendar] Processing reservations:', reservations.length);
console.log('[Calendar] Valid reservations:', validReservations.length);
console.log('[Calendar] Generated events:', events.length);
console.log('[Calendar] Reservations for date:', { date, count, reservations });
```

## 📋 주요 변경 파일

1. **`app/admin/reservations/page.tsx`**
   - 예약 데이터 로딩 시 limit을 1000으로 설정
   - checkin, checkout 필터 제거 (캘린더용)

2. **`app/admin/reservations/ReservationCalendarView.tsx`**
   - 날짜 비교 로직 개선 (시간 부분 제거)
   - 체크아웃 날짜 포함 로직 개선
   - 디버깅 로그 추가

3. **`app/admin/reservations/ReservationsViewClient.tsx`**
   - 뷰별 필터링 분리
   - 캘린더는 모든 예약, 리스트는 필터 적용

## 🔧 동작 방식

### 캘린더 뷰
1. 서버에서 모든 예약을 가져옴 (limit: 1000)
2. 모든 예약을 캘린더에 표시
3. 날짜 클릭 시 해당 날짜의 모든 예약을 모달로 표시

### 리스트 뷰
1. 서버에서 모든 예약을 가져옴
2. 클라이언트 사이드에서 필터 적용
3. 필터링된 예약만 표시

## ✅ 검증 방법

1. **캘린더에서 모든 예약 표시 확인**
   - 캘린더 뷰에서 모든 예약이 표시되는지 확인
   - 필터를 적용해도 캘린더에는 모든 예약이 표시되는지 확인

2. **날짜별 예약 필터링 확인**
   - 특정 날짜를 클릭하여 모달에서 해당 날짜의 모든 예약이 표시되는지 확인
   - 체크인/체크아웃 날짜 범위에 포함된 예약이 모두 표시되는지 확인

3. **리스트 뷰 필터링 확인**
   - 리스트 뷰에서 필터를 적용하여 정확히 필터링되는지 확인

## 📚 참고

- 날짜 비교는 항상 시간 부분을 제거하고 날짜만 비교해야 함
- 캘린더는 모든 예약을 표시해야 하므로 필터를 적용하지 않음
- 리스트 뷰는 클라이언트 사이드에서 필터링하여 성능 최적화
