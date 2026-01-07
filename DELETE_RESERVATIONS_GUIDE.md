# 예약 데이터 삭제 가이드

## 🔍 개요

Railway PostgreSQL 데이터베이스에서 기존 예약 데이터를 삭제하는 방법입니다.

⚠️ **주의**: 데이터 삭제는 되돌릴 수 없습니다. 삭제 전에 백업을 권장합니다.

---

## ✅ 방법 1: Railway PostgreSQL Query 탭 사용 (권장)

### 1단계: Railway 대시보드 접속

1. [Railway Dashboard](https://railway.app) 접속
2. 프로젝트 선택
3. **PostgreSQL** 서비스 클릭

### 2단계: Query 탭 열기

1. PostgreSQL 서비스 페이지에서 **Query** 탭 클릭
2. SQL 쿼리 입력 창이 열립니다

### 3단계: 예약 데이터 삭제 SQL 실행

#### 옵션 A: 모든 예약 삭제

```sql
-- 모든 예약 데이터 삭제
DELETE FROM reservations;
```

#### 옵션 B: 특정 조건으로 삭제

```sql
-- 특정 날짜 이전 예약만 삭제
DELETE FROM reservations 
WHERE checkin < '2024-01-01';

-- 특정 상태의 예약만 삭제
DELETE FROM reservations 
WHERE status = 'cancelled';

-- 특정 예약번호 삭제
DELETE FROM reservations 
WHERE reservation_number = '1124870293';
```

#### 옵션 C: 외래키 제약 조건 확인 후 삭제

```sql
-- orders 테이블과 연결된 예약이 있는지 확인
SELECT r.id, r.reservation_number, COUNT(o.id) as order_count
FROM reservations r
LEFT JOIN orders o ON o.reservation_id = r.id
GROUP BY r.id, r.reservation_number;

-- orders가 없는 예약만 삭제
DELETE FROM reservations 
WHERE id NOT IN (
  SELECT DISTINCT reservation_id 
  FROM orders 
  WHERE reservation_id IS NOT NULL
);
```

### 4단계: 삭제 확인

```sql
-- 삭제 후 남은 예약 개수 확인
SELECT COUNT(*) as total_reservations FROM reservations;

-- 남은 예약 목록 확인
SELECT 
  id,
  reservation_number,
  guest_name,
  checkin,
  checkout,
  status
FROM reservations
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ 방법 2: Railway CLI 사용

### 1단계: Railway CLI 설치 및 로그인

```bash
# Railway CLI 설치 (이미 설치되어 있다면 생략)
npm i -g @railway/cli

# Railway 로그인
railway login
```

### 2단계: 프로젝트 연결

```bash
# 프로젝트 디렉토리로 이동
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

# Railway 프로젝트 연결
railway link
```

### 3단계: PostgreSQL에 연결하여 SQL 실행

```bash
# PostgreSQL에 연결
railway connect postgresql

# 또는 psql 직접 사용
railway run psql $DATABASE_URL
```

연결 후 SQL 쿼리 실행:

```sql
DELETE FROM reservations;
```

---

## ✅ 방법 3: 백엔드 API 엔드포인트 추가 (선택사항)

개발 환경에서 API를 통해 삭제하고 싶다면, 백엔드에 삭제 엔드포인트를 추가할 수 있습니다.

### `railway-backend/src/routes/admin.routes.ts`에 추가:

```typescript
import { Router } from 'express';
import { Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// ... 기존 라우트들 ...

/**
 * 모든 예약 삭제 (개발/테스트용)
 * ⚠️ 주의: 프로덕션에서는 사용하지 마세요!
 */
router.delete('/reservations/all', async (req: Request, res: Response) => {
  try {
    // 프로덕션 환경에서는 차단
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        error: 'This endpoint is disabled in production',
        code: 'FORBIDDEN',
      });
    }

    const result = await pool.query('DELETE FROM reservations');
    
    res.status(200).json({
      message: 'All reservations deleted',
      deletedCount: result.rowCount,
    });
  } catch (error) {
    console.error('Delete all reservations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
});

export default router;
```

### 사용 방법:

```bash
# 개발 환경에서만 작동
curl -X DELETE \
  https://ouscaravan-production.up.railway.app/api/admin/reservations/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ 방법 4: SQL 마이그레이션 스크립트 사용

### `railway-backend/migrations/003_delete_all_reservations.sql` 생성:

```sql
-- 모든 예약 데이터 삭제
-- ⚠️ 주의: 이 스크립트는 모든 예약 데이터를 영구적으로 삭제합니다!

-- 외래키 제약 조건 확인
-- orders 테이블과 연결된 예약이 있다면 먼저 orders 삭제 필요
DELETE FROM orders WHERE reservation_id IS NOT NULL;

-- 모든 예약 삭제
DELETE FROM reservations;

-- 삭제 확인
SELECT COUNT(*) as remaining_reservations FROM reservations;
```

### 실행 방법:

1. Railway PostgreSQL Query 탭에서 위 SQL 실행
2. 또는 마이그레이션 스크립트로 추가 (자동 실행 비권장)

---

## 🔒 안전한 삭제 절차

### 1단계: 백업 (권장)

```sql
-- 삭제 전 백업 테이블 생성
CREATE TABLE reservations_backup AS 
SELECT * FROM reservations;

-- 백업 확인
SELECT COUNT(*) FROM reservations_backup;
```

### 2단계: 삭제 전 확인

```sql
-- 삭제될 데이터 확인
SELECT 
  COUNT(*) as total_count,
  COUNT(DISTINCT reservation_number) as unique_reservations,
  MIN(created_at) as oldest_reservation,
  MAX(created_at) as newest_reservation
FROM reservations;
```

### 3단계: 삭제 실행

```sql
-- 모든 예약 삭제
DELETE FROM reservations;
```

### 4단계: 삭제 확인

```sql
-- 삭제 확인
SELECT COUNT(*) as remaining_count FROM reservations;
-- 결과: 0이어야 함
```

### 5단계: 필요시 복구

```sql
-- 백업에서 복구 (필요시)
INSERT INTO reservations 
SELECT * FROM reservations_backup;

-- 백업 테이블 삭제 (복구 후)
DROP TABLE reservations_backup;
```

---

## ⚠️ 주의사항

### 1. 외래키 제약 조건

`orders` 테이블이 `reservations`를 참조하는 경우:

```sql
-- 먼저 orders 삭제
DELETE FROM orders WHERE reservation_id IS NOT NULL;

-- 그 다음 reservations 삭제
DELETE FROM reservations;
```

### 2. 관련 데이터 확인

```sql
-- orders와 연결된 예약 확인
SELECT 
  r.id,
  r.reservation_number,
  COUNT(o.id) as order_count
FROM reservations r
LEFT JOIN orders o ON o.reservation_id = r.id
GROUP BY r.id, r.reservation_number
HAVING COUNT(o.id) > 0;
```

### 3. 트랜잭션 사용 (권장)

```sql
-- 트랜잭션으로 안전하게 삭제
BEGIN;

-- 삭제 실행
DELETE FROM reservations;

-- 확인
SELECT COUNT(*) FROM reservations;

-- 문제 없으면 커밋
COMMIT;

-- 문제 있으면 롤백
-- ROLLBACK;
```

---

## 📋 삭제 후 확인 사항

### 1. 예약 개수 확인

```sql
SELECT COUNT(*) as total_reservations FROM reservations;
```

### 2. 시퀀스 리셋 (선택사항)

```sql
-- ID 시퀀스 리셋 (새 예약이 1부터 시작하도록)
-- 주의: UUID를 사용하는 경우 필요 없음
-- ALTER SEQUENCE reservations_id_seq RESTART WITH 1;
```

### 3. 인덱스 확인

```sql
-- 인덱스 상태 확인
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'reservations';
```

---

## 🔄 데이터 재입력

삭제 후 n8n 워크플로우를 통해 기존 이메일을 다시 처리:

1. **Gmail Get Many** 노드 실행
2. **HTTP Request** 노드로 전체 본문 가져오기
3. **Code Node**로 파싱
4. **HTTP Request** 노드로 Railway API에 전송

---

## 📚 참고

- [Railway PostgreSQL 문서](https://docs.railway.app/databases/postgresql)
- [PostgreSQL DELETE 문법](https://www.postgresql.org/docs/current/sql-delete.html)
- [Railway CLI 문서](https://docs.railway.app/develop/cli)
