# Railway 서버 크래시 문제 해결

## ❌ 문제: 서버가 시작 후 바로 종료됨

**증상:**
- Railway 로그에서 "Server is running on port 8080" 메시지 확인
- 곧바로 "Stopping Container" 메시지
- "Database connected" 메시지 없음
- 서버가 SIGTERM으로 종료됨

**원인:**
- 데이터베이스 연결 실패
- 서버 시작 시 데이터베이스 연결 테스트 없음
- 연결 실패 시 명확한 에러 메시지 없음

---

## ✅ 해결 방법

### 1단계: 코드 수정 완료

**수정된 파일:**
- `railway-backend/src/app.ts` - 서버 시작 시 데이터베이스 연결 테스트 추가
- `railway-backend/src/config/database.ts` - 연결 에러 처리 개선

**변경 사항:**
1. 서버 시작 시 데이터베이스 연결 테스트
2. 연결 실패 시 명확한 에러 메시지 출력
3. DATABASE_URL 환경 변수 확인

### 2단계: Railway에 변경사항 배포

**방법 1: Git 커밋 및 푸시 (권장)**

```bash
# 변경사항 커밋
git add railway-backend/src/app.ts railway-backend/src/config/database.ts
git commit -m "Fix: Add database connection test on server startup"
git push origin main
```

Railway가 자동으로 재배포합니다.

**방법 2: Railway에서 수동 재배포**

1. Railway 대시보드 → OUSCARAVAN 서비스
2. "Deployments" 탭
3. "Redeploy" 클릭

### 3단계: Railway 로그 확인

**Railway 대시보드 → OUSCARAVAN → Logs:**

**성공 시 예상 로그:**
```
Testing database connection...
Database connected successfully
Server is running on port 8080
Environment: production
```

**실패 시 예상 로그:**
```
Testing database connection...
Failed to start server: [에러 메시지]
DATABASE_URL: Set (또는 Not set)
Error message: [상세 에러]
```

---

## 🔍 Railway 환경 변수 확인

### 필수 환경 변수

**Railway 대시보드 → OUSCARAVAN → Variables:**

| 변수명 | 설명 | 확인 방법 |
|--------|------|----------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | Railway가 자동 설정 (Postgres 서비스 연결 시) |
| `JWT_SECRET` | JWT 토큰 비밀키 | 수동 설정 필요 |
| `NODE_ENV` | 환경 설정 | `production`으로 설정 |
| `PORT` | 서버 포트 | Railway가 자동 설정 |

### DATABASE_URL 확인

**Railway 대시보드 → Postgres → Variables:**

1. `DATABASE_URL` 변수가 있는지 확인
2. 값이 올바른지 확인
3. OUSCARAVAN 서비스에 연결되어 있는지 확인

**연결 확인:**
- Railway 대시보드 → OUSCARAVAN → Variables
- `DATABASE_URL` 변수가 자동으로 설정되어 있어야 함
- 또는 수동으로 Postgres 서비스의 `DATABASE_URL` 복사하여 설정

---

## 🐛 문제 해결

### 문제 1: DATABASE_URL이 설정되지 않음

**해결:**
1. Railway 대시보드 → OUSCARAVAN → Variables
2. `DATABASE_URL` 변수 확인
3. 없으면 Postgres 서비스의 `DATABASE_URL` 복사하여 추가

### 문제 2: 데이터베이스 연결 실패

**확인 사항:**
1. Postgres 서비스가 "Online" 상태인지 확인
2. 데이터베이스 마이그레이션이 완료되었는지 확인
3. Railway 로그에서 상세 에러 메시지 확인

### 문제 3: 서버가 계속 재시작됨

**해결:**
1. Railway 로그에서 에러 메시지 확인
2. `DATABASE_URL` 환경 변수 확인
3. 데이터베이스 연결 테스트

---

## 📋 체크리스트

- [ ] 코드 수정 완료 (`app.ts`, `database.ts`)
- [ ] Git 커밋 및 푸시
- [ ] Railway 자동 재배포 완료 대기
- [ ] Railway 로그에서 "Database connected successfully" 확인
- [ ] Railway 로그에서 "Server is running on port 8080" 확인
- [ ] Health Check 테스트: `https://ouscaravan-production.up.railway.app/health`
- [ ] 로그인 테스트

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
