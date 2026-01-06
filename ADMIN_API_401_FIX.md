# 관리자 API 401 에러 해결

## 🔍 문제 분석

**증상:**
- 로그인은 성공했지만, 관리자 페이지에서 API 호출 시 401 에러 발생
- Railway 로그: `API Key check: { hasApiKey: false, ... }`
- 브라우저 콘솔: `Failed to load resource: the server responded with a status of 401`

**원인:**
- 서버 컴포넌트에서 `adminApi()` 함수를 호출할 때 쿠키를 읽지 못함
- `lib/api.ts`의 `adminApi()`는 클라이언트 사이드에서만 쿠키를 읽음 (`document.cookie`)
- 서버 사이드에서는 `window`가 없어서 토큰이 `null`이 됨
- Railway API에 토큰 없이 요청하여 401 에러 발생

---

## ✅ 해결 방법

### 1. 서버 사이드 API 함수 생성

**새 파일:** `lib/admin-api-server.ts`

**기능:**
- Next.js `cookies()`를 사용하여 서버 사이드에서 쿠키 읽기
- 서버 컴포넌트에서 사용할 수 있는 API 호출 함수 제공

**주요 함수:**
- `adminApiServer()`: 서버 사이드 관리자 API 호출
- `getReservationsServer()`: 서버 사이드 예약 목록 조회
- `getAdminStatsServer()`: 서버 사이드 통계 조회

---

### 2. 서버 컴포넌트 수정

**수정된 파일:**
- `app/admin/reservations/page.tsx`
- `app/admin/page.tsx`

**변경 사항:**
- `getReservations()` → `getReservationsServer()`
- `getAdminStats()` → `getAdminStatsServer()`

---

## 🚀 변경 사항

### lib/admin-api-server.ts (신규)

```typescript
import { cookies } from 'next/headers';

export async function adminApiServer(
  endpoint: string,
  options: RequestInit = {}
) {
  // 서버 사이드에서 쿠키 읽기
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!token) {
    throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
  }

  const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  // ... 에러 처리 ...
}
```

### app/admin/reservations/page.tsx

**변경 전:**
```typescript
import { getReservations } from '@/lib/api';

const data = await getReservations({ ... });
```

**변경 후:**
```typescript
import { getReservationsServer } from '@/lib/admin-api-server';

const data = await getReservationsServer({ ... });
```

### app/admin/page.tsx

**변경 전:**
```typescript
import { getAdminStats, getReservations } from '@/lib/api';

stats = await getAdminStats();
const data = await getReservations({ limit: 5 });
```

**변경 후:**
```typescript
import { getAdminStatsServer, getReservationsServer } from '@/lib/admin-api-server';

stats = await getAdminStatsServer();
const data = await getReservationsServer({ limit: 5 });
```

---

## 📋 사용 가이드

### 서버 컴포넌트에서 사용

```typescript
import { getReservationsServer, getAdminStatsServer } from '@/lib/admin-api-server';

// 서버 컴포넌트
async function MyServerComponent() {
  const data = await getReservationsServer({
    status: 'pending',
    limit: 10,
  });
  
  return <div>{/* ... */}</div>;
}
```

### 클라이언트 컴포넌트에서 사용

```typescript
import { getReservations, getAdminStats } from '@/lib/api';

// 클라이언트 컴포넌트
function MyClientComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    getReservations({ status: 'pending' })
      .then(setData);
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

---

## 🔍 디버깅

### Railway 로그 확인

**정상 동작 시:**
```
API Key check: { hasApiKey: false, ... }
[AUTH] JWT token verified: { id: 'ouscaravan', ... }
```

**에러 발생 시:**
```
API Key check: { hasApiKey: false, ... }
[ERROR] Unauthorized: No token provided
```

### Vercel 로그 확인

**정상 동작 시:**
- 서버 컴포넌트에서 API 호출 성공
- 데이터가 정상적으로 렌더링됨

**에러 발생 시:**
- 401 에러 발생
- "로그인이 필요합니다" 메시지 표시

---

## 📋 체크리스트

### 코드 변경:
- [x] 서버 사이드 API 함수 생성 완료
- [x] 서버 컴포넌트 수정 완료
- [ ] Vercel 배포 완료
- [ ] 테스트 완료

### 테스트:
- [ ] 로그인 성공 확인
- [ ] 관리자 대시보드 로드 확인
- [ ] 예약 목록 조회 확인
- [ ] 방 목록 조회 확인 (클라이언트 컴포넌트)
- [ ] 통계 조회 확인

---

## 🎯 핵심 개선 사항

1. **서버/클라이언트 분리**: 서버 사이드와 클라이언트 사이드 API 함수 분리
2. **쿠키 읽기**: 서버 사이드에서 Next.js `cookies()` 사용
3. **인증 처리**: 토큰이 없으면 즉시 401 에러 반환

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
