# 예약 데이터 초기화 가이드

## 개요
기존 예약 데이터를 초기화하여 새로운 데이터 구조로 재시작하는 방법입니다.

## 방법 1: Railway CLI 사용 (권장)

### 1. Railway CLI 설치
```bash
npm install -g @railway/cli
```

### 2. Railway 로그인
```bash
railway login
```

### 3. 프로젝트 연결
```bash
railway link
```

### 4. PostgreSQL에 연결하여 SQL 실행
```bash
railway connect postgres
```

연결 후 다음 SQL 실행:
```sql
DELETE FROM reservations;
SELECT COUNT(*) as remaining_count FROM reservations;
```

## 방법 2: psql 명령어 사용

### 1. Railway에서 PostgreSQL 연결 정보 확인
- Railway 대시보드 → PostgreSQL 서비스 → Variables 탭
- `DATABASE_URL` 또는 `POSTGRES_URL` 확인

### 2. psql로 연결
```bash
psql "postgresql://user:password@host:port/database"
```

또는 환경 변수 사용:
```bash
psql $DATABASE_URL
```

### 3. SQL 실행
```sql
DELETE FROM reservations;
SELECT COUNT(*) as remaining_count FROM reservations;
\q
```

## 방법 3: 외부 PostgreSQL 클라이언트 사용

### pgAdmin, DBeaver, TablePlus 등 사용

1. Railway에서 PostgreSQL 연결 정보 확인:
   - Railway 대시보드 → PostgreSQL 서비스 → Variables 탭
   - `DATABASE_URL` 형식: `postgresql://user:password@host:port/database`

2. 연결 정보 추출:
   - **Host**: Railway PostgreSQL 호스트 주소
   - **Port**: 5432 (기본값)
   - **Database**: postgres (기본값)
   - **User**: Railway에서 제공하는 사용자명
   - **Password**: Railway에서 제공하는 비밀번호

3. 연결 후 SQL 실행:
```sql
DELETE FROM reservations;
SELECT COUNT(*) as remaining_count FROM reservations;
```

## 방법 4: Railway API 또는 서버 코드에서 실행

서버 코드에서 직접 실행할 수도 있습니다 (개발/테스트용):

```typescript
// railway-backend/src/scripts/clear-reservations.ts
import pool from '../config/database';

async function clearReservations() {
  try {
    const result = await pool.query('DELETE FROM reservations');
    console.log(`Deleted ${result.rowCount} reservations`);
    
    const countResult = await pool.query('SELECT COUNT(*) as count FROM reservations');
    console.log(`Remaining reservations: ${countResult.rows[0].count}`);
  } catch (error) {
    console.error('Error clearing reservations:', error);
  } finally {
    await pool.end();
  }
}

clearReservations();
```

## 방법 5: Railway 대시보드에서 직접 실행 (가능한 경우)

일부 Railway 플랜에서는 대시보드에서 직접 SQL을 실행할 수 있습니다:
1. Railway 대시보드 → PostgreSQL 서비스
2. **Data** 또는 **Database** 탭 확인
3. SQL 쿼리 입력 필드가 있으면 사용

## 주의사항

⚠️ **이 작업은 모든 예약 데이터를 영구적으로 삭제합니다.**
- 삭제 전에 백업을 권장합니다
- 방 데이터(rooms)는 삭제되지 않습니다
- 삭제 후 n8n 워크플로우를 통해 새로운 예약 데이터를 다시 수신할 수 있습니다

## 삭제 후 확인

1. Railway 로그에서 `[getRooms] Found rooms: 10` 확인 (방은 유지됨)
2. 예약 관리 페이지에서 예약이 0건인지 확인
3. n8n 워크플로우가 활성화되어 있는지 확인

## 빠른 참조: SQL 스크립트

```sql
-- 기존 예약 데이터 삭제
DELETE FROM reservations;

-- 확인 (결과가 0이어야 함)
SELECT COUNT(*) as remaining_count FROM reservations;

-- 방 데이터 확인 (10개여야 함)
SELECT COUNT(*) as room_count FROM rooms;
```
