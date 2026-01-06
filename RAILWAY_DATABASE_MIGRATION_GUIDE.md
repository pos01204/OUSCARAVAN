# Railway 데이터베이스 마이그레이션 가이드

## 📋 현재 상황

- Railway 환경 변수: 설정 완료 ✅
  - `DATABASE_URL`: 설정됨
  - `JWT_SECRET`: 설정됨
  - `NODE_ENV`: production
- PostgreSQL 데이터베이스: 테이블 없음 ❌
- Railway 서버: 응답 없음 (데이터베이스 연결 실패 가능성)

## 🔧 해결 방법: 데이터베이스 마이그레이션 실행

### 방법 1: Railway 대시보드에서 직접 실행 (권장)

1. **Railway 대시보드 접속**
   - Postgres 서비스 선택
   - "Database" 탭 클릭

2. **Query 탭 찾기**
   - "Data" 탭 옆에 **"Query"** 또는 **"SQL Editor"** 탭이 있을 수 있습니다
   - 상단 네비게이션에서 **"Query"** 탭을 찾아보세요
   - "Query" 탭이 보이지 않으면 아래 방법 2 또는 3 사용

3. **마이그레이션 SQL 실행**
   - Query 탭에서 SQL 입력 필드에 아래 SQL 코드 붙여넣기
   - **"Run"** 또는 **"Execute"** 버튼 클릭
   - 또는 Ctrl+Enter (Windows) / Cmd+Enter (Mac)로 실행

4. **테이블 생성 확인**
   - 다음 쿼리로 테이블 목록 확인:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

**예상 결과**:
- `reservations`
- `orders`
- `check_in_out_logs`
- `rooms`

### 방법 2: Railway CLI 사용

1. **Railway CLI 설치**
   ```bash
   npm install -g @railway/cli
   ```

2. **Railway 로그인**
   ```bash
   railway login
   ```

3. **프로젝트 연결**
   ```bash
   railway link
   ```

4. **데이터베이스 연결**
   ```bash
   railway connect
   ```

5. **마이그레이션 실행**
   ```bash
   # 로컬에서 SQL 파일 실행
   psql $DATABASE_URL -f railway-backend/migrations/001_initial_schema.sql
   ```

### 방법 3: 외부 PostgreSQL 클라이언트 사용

1. **연결 정보 확인**
   - Railway 대시보드 → Postgres → "Connect" 또는 "Credentials" 탭
   - 연결 정보 복사

2. **PostgreSQL 클라이언트 연결**
   - pgAdmin, DBeaver, 또는 다른 PostgreSQL 클라이언트 사용
   - 연결 정보 입력:
     - Host: `postgres.railway.internal` (Railway 내부) 또는 외부 호스트
     - Port: `5432`
     - Database: `railway`
     - Username: `postgres`
     - Password: Railway에서 제공한 비밀번호

3. **SQL 파일 실행**
   - `railway-backend/migrations/001_initial_schema.sql` 파일 열기
   - 쿼리 실행

## 📝 마이그레이션 SQL 파일 위치

파일 경로: `railway-backend/migrations/001_initial_schema.sql`

이 파일에는 다음 테이블 생성 SQL이 포함되어 있습니다:
- `reservations` - 예약 정보
- `orders` - 주문 정보
- `check_in_out_logs` - 체크인/체크아웃 로그
- `rooms` - 방 정보

## ✅ 마이그레이션 후 확인

### 1. 테이블 생성 확인

Railway 대시보드 → Postgres → Query 탭:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**예상 결과**:
```
table_name
-----------
check_in_out_logs
orders
reservations
rooms
```

### 2. Railway 서버 재배포

1. Railway 대시보드 → OUSCARAVAN 서비스
2. "Deploy" 또는 "Redeploy" 클릭
3. 배포 완료 대기
4. 로그에서 다음 메시지 확인:
   - "Server is running on port 8080"
   - "Database connected"

### 3. Health Check 테스트

브라우저에서:
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

### 4. 로그인 API 테스트

브라우저 개발자 도구 → Network 탭:
- 로그인 페이지에서 로그인 시도
- `/api/auth/login` 요청 확인
- 응답 상태 코드 확인

## 🐛 문제 해결

### 문제 1: 테이블이 생성되지 않음

**원인**:
- SQL 구문 오류
- 권한 문제
- 연결 문제

**해결**:
1. Railway 로그에서 에러 메시지 확인
2. SQL 구문 확인
3. 권한 확인

### 문제 2: 마이그레이션 후에도 서버가 응답하지 않음

**원인**:
- 서버가 재시작되지 않음
- 데이터베이스 연결 실패
- 다른 에러

**해결**:
1. Railway 서버 재배포
2. 로그에서 에러 메시지 확인
3. 데이터베이스 연결 확인

## 📋 체크리스트

- [ ] Railway PostgreSQL 데이터베이스에 연결
- [ ] `001_initial_schema.sql` 파일 내용 복사
- [ ] Query 탭에서 SQL 실행
- [ ] 테이블 생성 확인 (4개 테이블)
- [ ] Railway 서버 재배포
- [ ] 로그에서 "Database connected" 메시지 확인
- [ ] Health check 엔드포인트 테스트
- [ ] 로그인 API 테스트

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
