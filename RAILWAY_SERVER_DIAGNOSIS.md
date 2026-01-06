# Railway 서버 진단 가이드

## 🔍 현재 상황

- Railway 도메인: `ouscaravan-production.up.railway.app`
- 포트: 8080
- 서비스 상태: Online (Railway 대시보드)
- Health check 응답: 없음
- 로그인 API 응답: 없음

## 📋 확인 사항

### 1. Railway 서버 로그 확인

Railway 대시보드 → OUSCARAVAN 서비스 → Logs 탭:

**확인할 내용**:
- 서버가 정상적으로 시작되었는지
- "Server is running on port 8080" 메시지 확인
- 에러 메시지 확인
- 데이터베이스 연결 성공 메시지 확인

**예상 로그**:
```
Server is running on port 8080
Environment: production
Database connected
```

### 2. Railway 환경 변수 확인

Railway 대시보드 → OUSCARAVAN 서비스 → Variables 탭:

**필수 환경 변수**:
- `DATABASE_URL` - PostgreSQL 연결 문자열 (자동 설정)
- `JWT_SECRET` - JWT 토큰 비밀키 (설정 필요)
- `NODE_ENV` - `production`으로 설정
- `PORT` - Railway가 자동 할당 (보통 8080 또는 3000)

### 3. Railway 서버 포트 설정 확인

Railway는 `PORT` 환경 변수를 자동으로 설정합니다. 코드에서 이를 올바르게 읽고 있는지 확인:

```typescript
const PORT = process.env.PORT || 3000;
```

Railway가 포트 8080을 할당했다면, 서버는 8080에서 리스닝해야 합니다.

### 4. 데이터베이스 연결 확인

Railway 로그에서 다음 메시지 확인:
- "Database connected" - 성공
- "Unexpected error on idle client" - 실패

데이터베이스 연결 실패 시 서버가 시작되지 않을 수 있습니다.

## 🔧 해결 방법

### 방법 1: Railway 서버 재배포

1. Railway 대시보드 → OUSCARAVAN 서비스
2. "Deploy" 또는 "Redeploy" 클릭
3. 배포 완료 대기
4. 로그에서 "Server is running" 메시지 확인

### 방법 2: 환경 변수 확인 및 설정

Railway 대시보드 → Variables:

```env
JWT_SECRET=your-secret-key-here-min-32-characters
NODE_ENV=production
```

**중요**: `JWT_SECRET`이 설정되어 있지 않으면 서버가 시작되지 않을 수 있습니다.

### 방법 3: 데이터베이스 마이그레이션 확인

Railway PostgreSQL 데이터베이스에 스키마가 생성되었는지 확인:

1. Railway 대시보드 → Postgres 서비스
2. "Query" 탭 선택
3. 다음 쿼리 실행:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

다음 테이블이 있어야 합니다:
- `reservations`
- `orders`
- `check_in_out_logs`
- `rooms`

없다면 `railway-backend/migrations/001_initial_schema.sql` 파일을 실행하세요.

### 방법 4: Health Check 엔드포인트 확인

Railway 로그에서 다음을 확인:
- 서버가 정상적으로 시작되었는지
- `/health` 엔드포인트가 등록되었는지

코드에서 `/health` 엔드포인트가 라우트 등록 전에 정의되어 있는지 확인:

```typescript
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## 🧪 테스트 방법

### 1. Railway 로그 확인

Railway 대시보드 → Logs:
- 서버 시작 메시지 확인
- 에러 메시지 확인
- 데이터베이스 연결 메시지 확인

### 2. Health Check 테스트

브라우저에서 직접 접속:
```
https://ouscaravan-production.up.railway.app/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### 3. 로그인 API 테스트

브라우저 개발자 도구 → Network 탭:
- 로그인 시도
- `/api/auth/login` 요청 확인
- 응답 상태 코드 확인

## 🐛 일반적인 문제

### 문제 1: 서버가 시작되지 않음

**증상**: 로그에 "Server is running" 메시지가 없음

**원인**:
- 환경 변수 누락 (JWT_SECRET)
- 데이터베이스 연결 실패
- 빌드 오류

**해결**:
1. Railway 로그에서 에러 메시지 확인
2. 환경 변수 설정 확인
3. 데이터베이스 연결 확인

### 문제 2: 포트 불일치

**증상**: 서버가 다른 포트에서 실행 중

**원인**: Railway가 할당한 포트와 코드의 기본 포트 불일치

**해결**:
- Railway는 `PORT` 환경 변수를 자동 설정
- 코드에서 `process.env.PORT`를 사용하도록 확인

### 문제 3: 데이터베이스 연결 실패

**증상**: 로그에 "Unexpected error on idle client" 메시지

**원인**:
- `DATABASE_URL`이 잘못됨
- 데이터베이스가 실행되지 않음
- SSL 설정 문제

**해결**:
1. Railway에서 `DATABASE_URL` 자동 설정 확인
2. PostgreSQL 서비스 상태 확인
3. SSL 설정 확인

## 📝 체크리스트

- [ ] Railway 서버 로그에서 "Server is running" 메시지 확인
- [ ] `JWT_SECRET` 환경 변수 설정됨
- [ ] `DATABASE_URL` 환경 변수 자동 설정됨
- [ ] 데이터베이스 연결 성공 메시지 확인
- [ ] Health check 엔드포인트 응답 확인
- [ ] 데이터베이스 마이그레이션 완료
- [ ] Railway 서버가 "Online" 상태

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
