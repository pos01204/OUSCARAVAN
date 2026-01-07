# 자동 마이그레이션 설정 완료

## 구현 내용

Railway 배포 시 서버 시작과 함께 마이그레이션이 자동으로 실행되도록 설정했습니다.

### 변경 사항

1. **마이그레이션 실행 모듈 생성** (`railway-backend/src/migrations/run-migrations.ts`):
   - 서버 시작 시 자동으로 마이그레이션 실행
   - 기본 10개 방 데이터 (A1~A8, B1~B2) 자동 삽입
   - 이미 존재하는 방은 건너뜀 (ON CONFLICT 처리)

2. **서버 시작 로직 수정** (`railway-backend/src/app.ts`):
   - 데이터베이스 연결 성공 후 마이그레이션 자동 실행
   - 마이그레이션 실패해도 서버는 계속 실행 (안전성)

## 작동 방식

1. Railway에서 서버가 시작되면:
   - 데이터베이스 연결 시도
   - 연결 성공 시 마이그레이션 자동 실행
   - 10개 방 데이터 삽입 (없는 경우만)

2. 마이그레이션 로그:
   ```
   [MIGRATION] Starting migrations...
   [MIGRATION] Running 002_default_rooms...
   [MIGRATION] ✓ 002_default_rooms completed
   [MIGRATION] Current room count: 10
   [MIGRATION] All migrations completed
   ```

## 확인 방법

### 1. Railway 로그 확인

Railway 대시보드에서 로그를 확인하면:
- `[MIGRATION] Starting migrations...` 메시지 확인
- `[MIGRATION] Current room count: 10` 확인
- `[getRooms] Found rooms: 10` 확인

### 2. 방 관리 페이지 확인

- 방 관리 페이지에서 10개 방 (A1~A8, B1~B2)이 모두 표시되는지 확인
- 브라우저 콘솔에서 `[RoomsPage] Fetched rooms: 10` 확인

## 주의사항

- 마이그레이션은 서버가 시작될 때마다 실행되지만, `ON CONFLICT (name) DO NOTHING`으로 중복 삽입을 방지합니다.
- 이미 방이 존재하는 경우 자동으로 건너뜁니다.
- 마이그레이션 실패해도 서버는 계속 실행됩니다 (안전성).

## 다음 단계

1. **코드 커밋 및 푸시**:
   ```bash
   git add .
   git commit -m "Add auto-migration for default rooms"
   git push
   ```

2. **Railway 자동 배포 확인**:
   - Railway가 자동으로 배포를 시작합니다
   - 배포 완료 후 로그에서 마이그레이션 실행 확인

3. **테스트**:
   - 방 관리 페이지에서 10개 방이 모두 표시되는지 확인

## 문제 해결

### 마이그레이션이 실행되지 않는 경우

1. Railway 로그 확인:
   - `[MIGRATION]` 메시지가 있는지 확인
   - 에러 메시지 확인

2. 수동 실행 (임시):
   - Railway 대시보드에서 PostgreSQL 데이터베이스 선택
   - "Connect" 버튼 클릭하여 연결 정보 확인
   - psql 또는 다른 클라이언트로 연결하여 수동 실행

### 방이 여전히 1개만 있는 경우

1. Railway 로그에서 `[MIGRATION] Current room count: X` 확인
2. X가 1이면 마이그레이션이 실행되지 않은 것입니다
3. Railway 재배포 또는 수동 실행 필요
