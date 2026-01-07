# 예약 데이터 초기화 가이드

## 개요
기존 예약 데이터를 초기화하여 새로운 데이터 구조로 재시작하는 방법입니다.

## 방법 1: Railway PostgreSQL Query 탭 사용 (권장)

1. Railway 대시보드에서 PostgreSQL 서비스 선택
2. **Query** 탭 클릭
3. 아래 SQL 실행:

```sql
-- 기존 예약 데이터 삭제
DELETE FROM reservations;

-- 확인 (결과가 0이어야 함)
SELECT COUNT(*) as remaining_count FROM reservations;
```

## 방법 2: 마이그레이션 파일 사용

`railway-backend/migrations/005_clear_reservations.sql` 파일을 Railway PostgreSQL Query 탭에서 실행합니다.

## 주의사항

⚠️ **이 작업은 모든 예약 데이터를 영구적으로 삭제합니다.**
- 삭제 전에 백업을 권장합니다
- 방 데이터(rooms)는 삭제되지 않습니다
- 삭제 후 n8n 워크플로우를 통해 새로운 예약 데이터를 다시 수신할 수 있습니다

## 삭제 후 확인

1. Railway 로그에서 `[getRooms] Found rooms: 10` 확인 (방은 유지됨)
2. 예약 관리 페이지에서 예약이 0건인지 확인
3. n8n 워크플로우가 활성화되어 있는지 확인
