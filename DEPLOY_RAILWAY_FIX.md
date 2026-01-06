# Railway 서버 크래시 수정 배포 가이드

## ✅ 수정 완료

**수정된 파일:**
1. `railway-backend/src/app.ts` - 서버 시작 시 데이터베이스 연결 테스트 추가
2. `railway-backend/src/config/database.ts` - 연결 에러 처리 개선

**변경 사항:**
- 서버 시작 전 데이터베이스 연결 테스트
- 연결 실패 시 명확한 에러 메시지 출력
- DATABASE_URL 환경 변수 확인

---

## 🚀 배포 방법

### 방법 1: Git 커밋 및 푸시 (권장)

**PowerShell에서:**

```powershell
# 프로젝트 디렉토리로 이동
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

# 변경사항 확인
git status

# 변경사항 추가
git add railway-backend/src/app.ts railway-backend/src/config/database.ts

# 커밋
git commit -m "Fix: Add database connection test on server startup"

# 푸시
git push origin main
```

Railway가 자동으로 재배포합니다.

---

### 방법 2: Railway에서 수동 재배포

1. Railway 대시보드 → OUSCARAVAN 서비스
2. "Deployments" 탭
3. "Redeploy" 클릭

---

## 🔍 배포 후 확인

### 1단계: Railway 로그 확인

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
Error stack: [스택 트레이스]
```

### 2단계: Health Check 테스트

**브라우저에서:**
```
https://ouscaravan-production.up.railway.app/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### 3단계: 로그인 API 테스트

**PowerShell에서:**

```powershell
curl -X POST https://ouscaravan-production.up.railway.app/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"id\":\"ouscaravan\",\"password\":\"123456789a\"}'
```

**예상 응답:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800
}
```

### 4단계: Vercel 로그인 테스트

1. **브라우저 캐시 삭제** (Ctrl+Shift+Delete)
2. **로그인 페이지 접속:**
   ```
   https://ouscaravan.vercel.app/login
   ```
3. **로그인 시도:**
   - ID: `ouscaravan`
   - Password: `123456789a`

---

## 🐛 문제 해결

### 문제 1: DATABASE_URL이 설정되지 않음

**확인:**
- Railway 대시보드 → OUSCARAVAN → Variables
- `DATABASE_URL` 변수가 있는지 확인

**해결:**
- Railway 대시보드 → Postgres → Variables
- `DATABASE_URL` 복사
- OUSCARAVAN → Variables → `DATABASE_URL` 추가

### 문제 2: 데이터베이스 연결 실패

**확인:**
- Railway 로그에서 상세 에러 메시지 확인
- Postgres 서비스가 "Online" 상태인지 확인
- 데이터베이스 마이그레이션이 완료되었는지 확인

**해결:**
- 데이터베이스 마이그레이션 재실행
- Postgres 서비스 재시작

---

## 📋 체크리스트

- [x] 코드 수정 완료
- [ ] Git 커밋 및 푸시
- [ ] Railway 자동 재배포 완료 대기
- [ ] Railway 로그에서 "Database connected successfully" 확인
- [ ] Railway 로그에서 "Server is running on port 8080" 확인
- [ ] Health Check 테스트 성공
- [ ] 로그인 API 테스트 성공
- [ ] Vercel 로그인 테스트 성공

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
