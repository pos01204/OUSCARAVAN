# 빌드 오류 수정 내역

## 📅 수정 일시
2024-01-15

---

## 🔧 수정된 오류

### 0. TypeScript 타입 오류 (추가 수정)

**파일**: `app/guest/[token]/page.tsx`

**오류 내용**:
```
Type error: Type 'Reservation | null' is not assignable to type 'Reservation'.
Type 'null' is not assignable to type 'Reservation'.
```

**원인**:
- `reservation` 변수가 `null`로 초기화되어 있어 TypeScript가 `null` 가능성을 인식
- `GuestHomeContent` 컴포넌트에 `reservation`을 전달할 때 `null` 체크가 없음

**수정 방법**:
- `notFound()` 호출 후 명시적인 타입 가드 추가
- `reservation`이 `null`인 경우 다시 `notFound()` 호출하여 타입을 좁힘

**수정 코드**:
```typescript
// 수정 전
try {
  reservation = await guestApi(params.token);
} catch (error) {
  notFound();
}

return (
  <GuestHomeContent reservation={reservation} token={params.token} />
);

// 수정 후
try {
  reservation = await guestApi(params.token);
} catch (error) {
  notFound();
}

// TypeScript 타입 가드 추가
if (!reservation) {
  notFound();
}

return (
  <GuestHomeContent reservation={reservation} token={params.token} />
);
```

---

### 1. TypeScript 타입 오류

**파일**: `app/guest/[token]/layout.tsx`

**오류 내용**:
```
Type error: 'reservation' is possibly 'null'.
```

**원인**:
- `reservation` 변수가 `null`로 초기화되어 있어 TypeScript가 `null` 가능성을 인식
- `notFound()` 호출 후에도 TypeScript가 타입을 좁히지 못함

**수정 방법**:
- `notFound()` 호출 후 명시적인 타입 가드 추가
- `reservation`이 `null`인 경우 다시 `notFound()` 호출하여 타입을 좁힘

**수정 코드**:
```typescript
// 수정 전
try {
  reservation = await guestApi(params.token);
} catch (error) {
  notFound();
}

// 수정 후
try {
  reservation = await guestApi(params.token);
} catch (error) {
  notFound();
}

// TypeScript 타입 가드 추가
if (!reservation) {
  notFound();
}
```

---

### 2. React Hook 경고

**파일**: 
- `app/admin/orders/page.tsx`
- `app/admin/rooms/page.tsx`

**경고 내용**:
```
React Hook useEffect has a missing dependency: 'fetchOrders'. 
Either include it or remove the dependency array.
```

**원인**:
- `useEffect` 내부에서 `fetchOrders` 또는 `fetchRooms` 함수를 호출하지만 의존성 배열에 포함되지 않음
- ESLint의 `react-hooks/exhaustive-deps` 규칙 위반

**수정 방법**:
- 함수를 `useEffect` 이전에 정의
- `useEffect` 내부에서 함수 호출
- 의존성 배열에 `eslint-disable-next-line` 주석 추가 (의도적으로 빈 배열 사용)

**수정 코드**:
```typescript
// 수정 전
useEffect(() => {
  fetchOrders();
}, []);

const fetchOrders = async () => {
  // ...
};

// 수정 후
const fetchOrders = async () => {
  // ...
};

useEffect(() => {
  fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

---

## ✅ 수정 결과

### 빌드 성공
- TypeScript 타입 오류 해결
- React Hook 경고 해결
- Vercel 및 Railway 빌드 성공

### 수정된 파일
- `app/guest/[token]/layout.tsx` - TypeScript 타입 가드 추가
- `app/guest/[token]/page.tsx` - TypeScript 타입 가드 추가
- `app/admin/orders/page.tsx` - React Hook 경고 수정
- `app/admin/rooms/page.tsx` - React Hook 경고 수정

---

## 📝 참고사항

### TypeScript 타입 가드
- `notFound()`는 함수이므로 TypeScript가 타입을 좁히지 못함
- 명시적인 `null` 체크를 통해 타입을 좁혀야 함

### React Hook 의존성
- `fetchOrders`와 `fetchRooms`는 컴포넌트 내부에서 정의되므로 의존성 배열에 포함해야 함
- 하지만 이 경우 컴포넌트 마운트 시 한 번만 실행하려는 의도이므로 `eslint-disable-next-line` 주석 사용
- 대안: `useCallback`을 사용하여 함수를 메모이제이션할 수 있음

---

### 3. BBQCarousel 컴포넌트 prop 오류

**파일**: `components/guest/GuestGuideContent.tsx`

**오류 내용**:
```
Type error: Property 'onClose' is missing in type '{ slides: ... }' but required in type 'BBQCarouselProps'.
```

**원인**:
- `BBQCarousel` 컴포넌트가 `onClose` prop을 필수로 요구
- `GuestGuideContent`에서 `onClose` prop을 전달하지 않음

**수정 방법**:
- `BBQCarousel`에 `onClose` prop 추가

**수정 코드**:
```typescript
// 수정 전
<BBQCarousel slides={BBQ_GUIDE_SLIDES} />

// 수정 후
<BBQCarousel slides={BBQ_GUIDE_SLIDES} onClose={() => setShowBBQCarousel(false)} />
```

---

**문서 버전**: 1.1  
**최종 업데이트**: 2024-01-15
