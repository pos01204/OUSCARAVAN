# Vercel 빌드 오류 수정 가이드

## 🔍 발견된 오류

### 1. date-fns 포맷 오류

**에러 메시지:**
```
Use `d` instead of `D` (in `D`) for formatting days of the month
```

**원인:**
- `date-fns` v3에서는 `D` (일년 중 몇 번째 날) 대신 `d` (일)를 사용해야 함
- `ReservationCalendarView.tsx`에서 `D`를 사용하고 있었음

**수정:**
- `dayFormat: 'D'` → `dayFormat: 'd'`
- `format(start, 'M월 D일', ...)` → `format(start, 'M월 d일', ...)`

### 2. Vercel 정적 렌더링 오류

**에러 메시지:**
```
Route /api/admin/orders couldn't be rendered statically because it used `cookies`
```

**원인:**
- Next.js가 API 라우트를 정적으로 렌더링하려고 시도
- `cookies()`를 사용하는 라우트는 동적 렌더링이 필요함

**수정:**
- 모든 API 라우트에 `export const dynamic = 'force-dynamic'` 추가

## ✅ 수정된 파일

### 1. `app/admin/reservations/ReservationCalendarView.tsx`

```typescript
// 수정 전
formats={{
  dayFormat: 'D',
  dayRangeHeaderFormat: ({ start, end }) =>
    `${format(start, 'M월 D일', { locale: ko })} - ${format(end, 'M월 D일', { locale: ko })}`,
}}

// 수정 후
formats={{
  dayFormat: 'd',
  dayRangeHeaderFormat: ({ start, end }) =>
    `${format(start, 'M월 d일', { locale: ko })} - ${format(end, 'M월 d일', { locale: ko })}`,
}}
```

### 2. API 라우트 파일들

다음 파일들에 `export const dynamic = 'force-dynamic'` 추가:

- `app/api/admin/orders/route.ts`
- `app/api/admin/orders/[id]/route.ts`
- `app/api/admin/rooms/route.ts`
- `app/api/admin/rooms/[id]/route.ts`
- `app/api/admin/reservations/[id]/route.ts`

**추가된 코드:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/constants';

// 동적 렌더링 강제 (cookies 사용)
export const dynamic = 'force-dynamic';

const API_URL = API_CONFIG.baseUrl;
```

## 📋 date-fns 포맷 참고

### 올바른 포맷 토큰

- `d` - 일 (1-31)
- `D` - 일년 중 몇 번째 날 (1-366) ❌ 사용하지 않음
- `M` - 월 (1-12)
- `y` - 연도

### 예시

```typescript
// 올바른 사용
format(date, 'M월 d일', { locale: ko })  // "1월 8일"
format(date, 'yyyy년 M월 d일', { locale: ko })  // "2026년 1월 8일"

// 잘못된 사용
format(date, 'M월 D일', { locale: ko })  // ❌ 에러 발생
```

## 🔧 Next.js 동적 렌더링

### 정적 vs 동적 렌더링

- **정적 렌더링**: 빌드 시점에 HTML 생성 (SSG)
- **동적 렌더링**: 요청 시점에 HTML 생성 (SSR)

### `cookies()` 사용 시

`cookies()`를 사용하는 라우트는 항상 동적 렌더링이 필요합니다:

```typescript
export const dynamic = 'force-dynamic';
```

### 다른 동적 렌더링 트리거

- `cookies()`
- `headers()`
- `searchParams` (동적)
- `params` (동적)

## ✅ 확인 사항

1. ✅ `date-fns` 포맷 오류 수정 완료
2. ✅ 모든 API 라우트에 동적 렌더링 설정 추가
3. ⏳ Vercel 배포 테스트

## 📚 참고

- [date-fns 포맷 토큰 문서](https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md)
- [Next.js 동적 렌더링 문서](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)
