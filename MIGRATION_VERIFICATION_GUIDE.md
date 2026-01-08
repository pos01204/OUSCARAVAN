# 마이그레이션 실행 확인 가이드

## 📋 개요

PostgreSQL이 정상적으로 시작되었습니다. 이제 백엔드 서버 로그에서 마이그레이션이 자동으로 실행되었는지 확인하는 방법을 안내합니다.

---

## ✅ PostgreSQL 시작 확인

보여주신 로그는 PostgreSQL이 정상적으로 시작되었음을 나타냅니다:

```
2026-01-08 11:58:28.251 UTC [6] LOG:  database system is ready to accept connections
```

**의미**:
- PostgreSQL 17.7이 정상적으로 시작됨
- 데이터베이스가 연결을 받을 준비가 됨
- 자동 복구가 완료됨

---

## 🔍 백엔드 서버 로그 확인

### 1. Railway 대시보드에서 로그 확인

1. **Railway 대시보드 접속**
   - Railway 프로젝트 → **백엔드 서비스** 선택

2. **Logs 탭 열기**
   - 백엔드 서비스 → **Logs** 탭 클릭

3. **마이그레이션 로그 확인**
   다음 로그가 표시되어야 합니다:

   ```
   [MIGRATION] Starting migrations...
   [MIGRATION] Running 002_default_rooms...
   [MIGRATION] ✓ 002_default_rooms completed
   [MIGRATION] Running 004_add_reservation_options...
   [MIGRATION] ✓ 004_add_reservation_options completed
   [MIGRATION] Running 005_add_notifications...
   [MIGRATION] ✓ 005_add_notifications completed
   [MIGRATION] Running 006_update_rooms_to_numbered...
   [MIGRATION] ✓ 006_update_rooms_to_numbered completed
   [MIGRATION] Current room count: 10
   [MIGRATION] All migrations completed
   ```

### 2. 마이그레이션이 실행되지 않은 경우

만약 위의 로그가 보이지 않는다면:

1. **서버 재시작**
   - Railway 대시보드 → 백엔드 서비스 → **Settings** 탭
   - **Restart** 버튼 클릭

2. **로그 다시 확인**
   - 서버 재시작 후 Logs 탭에서 마이그레이션 로그 확인

---

## 🗄️ 데이터베이스 직접 확인

### 방법 1: Railway Query 탭 사용

1. **Railway 대시보드 접속**
   - Railway 프로젝트 → **PostgreSQL 서비스** 선택

2. **Query 탭 열기**
   - PostgreSQL 서비스 → **Query** 탭 클릭

3. **방 목록 확인**
   ```sql
   -- 1호~10호 방이 있는지 확인
   SELECT name, type, capacity, status 
   FROM rooms 
   WHERE name ~ '^\d+호$'
   ORDER BY CAST(SUBSTRING(name FROM '^(\d+)') AS INTEGER);
   ```

   **예상 결과**:
   ```
   name | type         | capacity | status
   -----|--------------|----------|--------
   1호  | 오션뷰카라반 | 4        | available
   2호  | 오션뷰카라반 | 4        | available
   3호  | 오션뷰카라반 | 4        | available
   4호  | 오션뷰카라반 | 4        | available
   5호  | 오션뷰카라반 | 4        | available
   6호  | 오션뷰카라반 | 2        | available
   7호  | 오션뷰카라반 | 4        | available
   8호  | 오션뷰카라반 | 4        | available
   9호  | 오션뷰카라반 | 4        | available
   10호 | 오션뷰카라반 | 2        | available
   ```

4. **A1~A8, B1~B2 남아있는지 확인**
   ```sql
   -- 방 테이블에서 A1~A8, B1~B2가 남아있는지 확인
   SELECT name FROM rooms 
   WHERE name IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2');
   ```

   **예상 결과**: 빈 결과 (0 rows) - A1~A8, B1~B2가 모두 1호~10호로 변경되어야 함

5. **예약 테이블의 assigned_room 확인**
   ```sql
   -- 예약의 assigned_room이 1호~10호로 변경되었는지 확인
   SELECT DISTINCT assigned_room, COUNT(*) as count 
   FROM reservations 
   WHERE assigned_room IS NOT NULL 
   GROUP BY assigned_room 
   ORDER BY assigned_room;
   ```

   **예상 결과**: A1~A8, B1~B2가 모두 1호~10호로 변경되어야 함

6. **A1~A8, B1~B2가 남아있는지 확인**
   ```sql
   -- 예약 테이블에서 A1~A8, B1~B2가 남아있는지 확인
   SELECT DISTINCT assigned_room FROM reservations 
   WHERE assigned_room IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2');
   ```

   **예상 결과**: 빈 결과 (0 rows) - 모든 예약의 assigned_room이 1호~10호로 변경되어야 함

---

## 🔧 마이그레이션이 실행되지 않은 경우 수동 실행

### 방법 1: Railway Query 탭에서 직접 실행

1. **Railway 대시보드 접속**
   - Railway 프로젝트 → PostgreSQL 서비스 → **Query** 탭

2. **마이그레이션 SQL 복사**
   - `railway-backend/migrations/006_update_rooms_to_numbered.sql` 파일 내용 전체 복사

3. **SQL 실행**
   - Query 탭에 SQL 붙여넣기
   - **Run** 버튼 클릭

4. **결과 확인**
   - 위의 "데이터베이스 직접 확인" 섹션의 쿼리로 확인

### 방법 2: 백엔드 서버 재시작

1. **Railway 대시보드 접속**
   - Railway 프로젝트 → 백엔드 서비스 → **Settings** 탭

2. **서버 재시작**
   - **Restart** 버튼 클릭

3. **로그 확인**
   - **Logs** 탭에서 마이그레이션 실행 로그 확인

---

## 📊 마이그레이션 상태 체크리스트

다음 항목을 확인하여 마이그레이션이 성공적으로 완료되었는지 확인하세요:

- [ ] 백엔드 서버 로그에 `[MIGRATION] ✓ 006_update_rooms_to_numbered completed` 메시지 확인
- [ ] `rooms` 테이블에 1호~10호 방이 존재 (총 10개)
- [ ] `rooms` 테이블에 A1~A8, B1~B2가 없음
- [ ] `reservations` 테이블의 `assigned_room`이 모두 1호~10호 형식
- [ ] `reservations` 테이블에 A1~A8, B1~B2가 없음
- [ ] 6호와 10호의 `capacity`가 2인실로 설정됨
- [ ] 나머지 방(1~5, 7~9)의 `capacity`가 4인실로 설정됨

---

## ⚠️ 문제 해결

### 문제 1: 마이그레이션 로그가 보이지 않음

**원인**: 서버가 시작되기 전에 데이터베이스 연결이 실패했을 수 있음

**해결 방법**:
1. 백엔드 서버 재시작
2. Logs 탭에서 데이터베이스 연결 로그 확인:
   ```
   Database connected successfully
   ```

### 문제 2: 마이그레이션은 실행되었지만 데이터가 변경되지 않음

**원인**: 마이그레이션 SQL이 실행되었지만 데이터가 없거나 조건에 맞지 않음

**해결 방법**:
1. 현재 데이터 상태 확인:
   ```sql
   SELECT name FROM rooms;
   SELECT DISTINCT assigned_room FROM reservations WHERE assigned_room IS NOT NULL;
   ```
2. 수동으로 마이그레이션 SQL 실행 (위의 "수동 실행" 섹션 참고)

### 문제 3: capacity가 잘못 설정됨

**원인**: 마이그레이션 SQL의 capacity 업데이트 로직 문제

**해결 방법**:
```sql
-- 6호와 10호를 2인실로 수정
UPDATE rooms 
SET capacity = 2, updated_at = NOW()
WHERE name IN ('6호', '10호');

-- 나머지를 4인실로 수정
UPDATE rooms 
SET capacity = 4, updated_at = NOW()
WHERE name IN ('1호', '2호', '3호', '4호', '5호', '7호', '8호', '9호');
```

---

## 📝 참고

- **자동 마이그레이션**: 백엔드 서버가 시작될 때 자동으로 실행됨 (`app.ts`의 `startServer()` 함수)
- **마이그레이션 파일**: `railway-backend/migrations/006_update_rooms_to_numbered.sql`
- **실행 로직**: `railway-backend/src/migrations/run-migrations.ts`
- **서버 시작 파일**: `railway-backend/src/app.ts`

---

**작성 일시**: 2026-01-08  
**작성자**: AI Assistant  
**버전**: 1.0  
**상태**: 마이그레이션 확인 가이드 완료
