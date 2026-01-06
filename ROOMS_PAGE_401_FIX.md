# 방 관리 페이지 401 에러 해결

## 🔍 문제 분석

**증상:**
- 방 관리 페이지에서 401 에러 발생
- 방 추가/수정/삭제 실패
- `Failed to load resource: the server responded with a status of 401`

**원인:**
- 클라이언트 컴포넌트에서 `httpOnly: true` 쿠키를 읽을 수 없음
- `lib/api.ts`의 `adminApi()`가 `document.cookie`로 쿠키를 읽으려고 시도
- `httpOnly` 쿠키는 JavaScript에서 접근 불가
- 토큰이 `null`이 되어 401 에러 발생

---

## ✅ 해결 방법

### 1. Next.js API 라우트 생성

**새 파일:**
- `app/api/admin/rooms/route.ts` - 방 목록 조회 및 추가
- `app/api/admin/rooms/[id]/route.ts` - 방 수정 및 삭제

**기능:**
- 서버 사이드에서 쿠키 읽기 (`cookies()`)
- Railway API 호출 시 토큰 포함
- 클라이언트 컴포넌트에서 안전하게 호출 가능

---

### 2. 클라이언트 API 함수 수정

**수정된 파일:** `lib/api.ts`

**변경 사항:**
- `getRooms()`, `createRoom()`, `updateRoom()`, `deleteRoom()` 함수 수정
- Next.js API 라우트를 통해 호출하도록 변경
- `credentials: 'include'`로 쿠키 자동 전송

---

## 🚀 변경 사항

### app/api/admin/rooms/route.ts (신규)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/constants';

const API_URL = API_CONFIG.baseUrl;

// 방 목록 조회
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const response = await fetch(`${API_URL}/api/admin/rooms`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  // ... 에러 처리 ...
}

// 방 추가
export async function POST(request: NextRequest) {
  // ... 동일한 패턴 ...
}
```

### lib/api.ts 수정

**변경 전:**
```typescript
export async function getRooms(): Promise<Room[]> {
  const data = await adminApi('/api/admin/rooms');
  return Array.isArray(data) ? data : (data.rooms || []);
}
```

**변경 후:**
```typescript
export async function getRooms(): Promise<Room[]> {
  const response = await fetch('/api/admin/rooms', {
    method: 'GET',
    credentials: 'include', // 쿠키 자동 전송
  });

  if (!response.ok) {
    // ... 에러 처리 ...
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.rooms || []);
}
```

---

## 📋 기본 10개 방 생성

**새 파일:** `railway-backend/migrations/002_default_rooms.sql`

**기능:**
- 기본 10개 방 데이터 삽입
- 오션뷰 5개, 가든뷰 5개
- 이미 존재하는 방은 무시 (ON CONFLICT DO NOTHING)

**실행 방법:**
```bash
# Railway PostgreSQL에 직접 연결하여 실행
# 또는 Railway 대시보드에서 SQL 실행
```

---

## 🔧 방 배정 프로세스 개선

**현재 구현:**
- 예약 상세 페이지에서 방 배정
- 전화번호 입력 필요
- n8n 연동으로 알림톡 발송

**개선 방향:**
- 예약 목록에서 예약자 번호만으로 빠른 방 배정
- 자동으로 사용 가능한 방 선택
- 최소한의 입력으로 방 배정 완료

---

## 📋 체크리스트

### 코드 변경:
- [x] Next.js API 라우트 생성 완료
- [x] 클라이언트 API 함수 수정 완료
- [x] 기본 방 데이터 마이그레이션 생성 완료
- [ ] Railway 마이그레이션 실행
- [ ] Vercel 배포 완료
- [ ] 테스트 완료

### 테스트:
- [ ] 방 목록 조회 확인
- [ ] 방 추가 확인
- [ ] 방 수정 확인
- [ ] 방 삭제 확인
- [ ] 기본 10개 방 생성 확인

---

## 🎯 핵심 개선 사항

1. **httpOnly 쿠키 처리**: Next.js API 라우트를 통한 안전한 쿠키 전달
2. **기본 방 데이터**: 마이그레이션으로 기본 10개 방 생성
3. **방 배정 프로세스**: 예약자 번호만으로 빠른 방 배정 (향후 개선)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
