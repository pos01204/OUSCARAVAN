# 빠른 마이그레이션 실행 가이드 (psql 없이)

## 🚀 Node.js를 사용한 마이그레이션 (가장 간단)

psql 설치 없이 Node.js 스크립트로 마이그레이션을 실행할 수 있습니다.

### 1단계: pg 패키지 설치

PowerShell에서 실행:

```powershell
npm install pg
```

### 2단계: Railway 프로젝트 연결

```powershell
railway link
```

프롬프트가 나타나면:
- 프로젝트 선택: `dynamic-radiance` (또는 해당 프로젝트)
- 서비스 선택: `Postgres` (또는 아무 서비스나 선택)

### 3단계: 마이그레이션 실행

```powershell
railway run node run-migration.js
```

이 명령어는:
1. Railway 환경 변수(`DATABASE_URL`)를 자동으로 가져옵니다
2. 데이터베이스에 연결합니다
3. `MIGRATION_SQL_COMPLETE.sql` 파일을 실행합니다
4. 생성된 테이블을 확인합니다

---

## ✅ 실행 결과

성공하면 다음과 같은 메시지가 표시됩니다:

```
========================================
Railway PostgreSQL 마이그레이션 실행
========================================

[1/3] 데이터베이스 연결 중...
✅ 데이터베이스에 연결되었습니다.

[2/3] SQL 파일 읽는 중...
✅ SQL 파일을 읽었습니다.

[3/3] 마이그레이션 실행 중...
✅ 마이그레이션이 완료되었습니다!

생성된 테이블 확인 중...

✅ 생성된 테이블:
   - check_in_out_logs
   - orders
   - reservations
   - rooms

✅ 모든 테이블이 성공적으로 생성되었습니다!
```

---

## 🐛 문제 해결

### 문제 1: `pg` 패키지가 설치되지 않음

**해결**:
```powershell
npm install pg
```

### 문제 2: Railway 프로젝트가 연결되지 않음

**해결**:
```powershell
railway link
```

### 문제 3: DATABASE_URL 환경 변수가 없음

**해결**:
- `railway link`로 프로젝트 연결 확인
- Railway 대시보드에서 Postgres 서비스의 DATABASE_URL 환경 변수 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
