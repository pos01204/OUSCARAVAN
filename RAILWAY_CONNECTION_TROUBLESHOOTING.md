# Railway 연결 문제 해결 가이드

## 📋 문제 상황

Railway 백엔드 API 서버가 시작되지만, Vercel 프론트엔드에서 `network_error`가 발생합니다.

## 🔍 원인 분석

1. **Railway 서버 재시작**: SIGTERM 신호로 서버가 종료되고 재시작되는 현상
2. **CORS 설정**: 기본 CORS 설정만으로는 충분하지 않을 수 있음
3. **타임아웃**: 요청 타임아웃 설정 필요
4. **API URL**: Railway API URL이 올바르게 설정되지 않았을 수 있음

## ✅ 수정 내용

### 1. CORS 설정 개선 (`railway-backend/src/app.ts`)

- Vercel 도메인 명시적으로 허용
- `credentials: true` 설정으로 쿠키 전송 허용
- 허용할 HTTP 메서드 및 헤더 명시

### 2. 타임아웃 설정 추가 (`lib/auth.ts`)

- 10초 타임아웃 설정
- AbortController를 사용한 요청 취소

## 🔧 확인 사항

### 1. Railway API URL 확인

Vercel 대시보드 → Project Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
```

**중요**: Railway 대시보드에서 실제 서비스 URL을 확인하세요.

### 2. Railway 서버 상태 확인

Railway 대시보드에서:
- 서비스가 "Running" 상태인지 확인
- 로그에서 에러 메시지 확인
- Health check 엔드포인트 테스트:

```bash
curl https://your-railway-app.railway.app/health
```

### 3. 환경 변수 확인

Railway 대시보드 → Variables:

- `DATABASE_URL` - PostgreSQL 연결 문자열 (자동 설정)
- `JWT_SECRET` - JWT 토큰 비밀키 (설정 필요)
- `PORT` - 서버 포트 (Railway가 자동 할당)
- `NODE_ENV` - `production`으로 설정

### 4. 데이터베이스 마이그레이션 확인

Railway PostgreSQL 데이터베이스에 스키마가 생성되었는지 확인:

```sql
-- Railway PostgreSQL Query 탭에서 실행
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

다음 테이블이 있어야 합니다:
- `reservations`
- `orders`
- `check_in_out_logs`
- `rooms`

## 🧪 테스트 방법

### 1. Health Check

```bash
curl https://your-railway-app.railway.app/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### 2. 로그인 API 테스트

```bash
curl -X POST https://your-railway-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ouscaravan",
    "password": "123456789a"
  }'
```

**예상 응답**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800
}
```

### 3. Vercel에서 테스트

1. Vercel 대시보드에서 재배포
2. 로그인 페이지에서 로그인 시도
3. 브라우저 개발자 도구 → Network 탭에서 API 요청 확인
4. 에러 메시지 확인

## 🐛 문제 해결

### 문제 1: Railway 서버가 계속 재시작됨

**원인**: 
- 데이터베이스 연결 실패
- 환경 변수 누락
- 빌드 오류

**해결 방법**:
1. Railway 로그 확인
2. `DATABASE_URL` 확인
3. `JWT_SECRET` 설정 확인
4. 빌드 로그 확인

### 문제 2: CORS 에러

**증상**: 브라우저 콘솔에 CORS 에러 메시지

**해결 방법**:
1. Railway 백엔드의 CORS 설정 확인
2. Vercel 도메인이 허용 목록에 있는지 확인
3. `credentials: true` 설정 확인

### 문제 3: 타임아웃 에러

**증상**: 요청이 10초 이상 걸리거나 타임아웃 발생

**해결 방법**:
1. Railway 서버 로그 확인
2. 데이터베이스 연결 상태 확인
3. 네트워크 지연 확인

### 문제 4: 401 Unauthorized

**증상**: 로그인은 성공하지만 API 호출 시 401 에러

**해결 방법**:
1. JWT 토큰이 올바르게 저장되었는지 확인
2. `JWT_SECRET`이 Railway와 일치하는지 확인
3. 토큰 만료 시간 확인

## 📝 체크리스트

- [ ] Railway 서비스가 "Running" 상태
- [ ] `DATABASE_URL` 환경 변수 설정됨
- [ ] `JWT_SECRET` 환경 변수 설정됨
- [ ] 데이터베이스 마이그레이션 완료
- [ ] Health check 엔드포인트 응답 확인
- [ ] 로그인 API 엔드포인트 테스트 성공
- [ ] Vercel `NEXT_PUBLIC_API_URL` 환경 변수 설정됨
- [ ] CORS 설정 확인
- [ ] Railway 로그에 에러 없음

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
