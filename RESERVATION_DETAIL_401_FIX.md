# 예약 상세보기 401 에러 해결

## 🔍 문제 분석

**증상:**
- 예약 관리에서 상세보기 클릭 시 401 에러 발생
- `Failed to load resource: the server responded with a status of 401`

**원인:**
- 클라이언트 컴포넌트에서 `httpOnly: true` 쿠키를 읽을 수 없음
- `lib/api.ts`의 `getReservation()`, `updateReservation()`이 `adminApi()`를 사용
- `adminApi()`가 `document.cookie`로 쿠키를 읽으려고 시도
- `httpOnly` 쿠키는 JavaScript에서 접근 불가
- 토큰이 `null`이 되어 401 에러 발생

---

## ✅ 해결 방법

### 1. Next.js API 라우트 생성

**새 파일:** `app/api/admin/reservations/[id]/route.ts`

**기능:**
- 서버 사이드에서 쿠키 읽기 (`cookies()`)
- Railway API 호출 시 토큰 포함
- 클라이언트 컴포넌트에서 안전하게 호출 가능

**엔드포인트:**
- `GET /api/admin/reservations/[id]` - 예약 상세 조회
- `PATCH /api/admin/reservations/[id]` - 예약 업데이트 (방 배정)

---

### 2. 클라이언트 API 함수 수정

**수정된 파일:** `lib/api.ts`

**변경 사항:**
- `getReservation()` - Next.js API 라우트 사용
- `updateReservation()` - Next.js API 라우트 사용
- `credentials: 'include'`로 쿠키 자동 전송

---

## 🚀 변경 사항

### app/api/admin/reservations/[id]/route.ts (신규)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/constants';

// 예약 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const response = await fetch(`${API_URL}/api/admin/reservations/${params.id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  // ... 에러 처리 ...
}

// 예약 업데이트 (방 배정)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ... 동일한 패턴 ...
}
```

### lib/api.ts 수정

**변경 전:**
```typescript
export async function getReservation(id: string): Promise<Reservation> {
  return adminApi(`/api/admin/reservations/${id}`) as Promise<Reservation>;
}
```

**변경 후:**
```typescript
export async function getReservation(id: string): Promise<Reservation> {
  const response = await fetch(`/api/admin/reservations/${id}`, {
    method: 'GET',
    credentials: 'include', // 쿠키 자동 전송
  });

  if (!response.ok) {
    // ... 에러 처리 ...
  }

  return response.json() as Promise<Reservation>;
}
```

---

## 📋 체크리스트

### 코드 변경:
- [x] Next.js API 라우트 생성 완료
- [x] 클라이언트 API 함수 수정 완료
- [ ] Vercel 배포 완료
- [ ] 테스트 완료

### 테스트:
- [ ] 예약 목록에서 상세보기 클릭
- [ ] 예약 상세 정보 표시 확인
- [ ] 방 배정 기능 확인
- [ ] 전화번호 입력 확인
- [ ] 저장 및 알림톡 발송 확인

---

## 🎯 핵심 개선 사항

1. **httpOnly 쿠키 처리**: Next.js API 라우트를 통한 안전한 쿠키 전달
2. **예약 상세 조회**: 서버 사이드에서 쿠키 읽어 Railway API 호출
3. **방 배정 기능**: 예약 업데이트 시 토큰 포함하여 호출

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
