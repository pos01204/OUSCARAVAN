# Railway 헬스체크 및 서버 안정성 개선

## ❌ 문제: 서버가 시작 후 곧바로 종료됨

**증상:**
- 서버가 정상적으로 시작됨 ("Server is running on port 8080")
- 곧바로 "Stopping Container" 메시지
- SIGTERM으로 프로세스 종료
- 로그인이 되지 않음

**원인:**
- Railway 헬스체크 실패 가능성
- 서버가 헬스체크 요청에 응답하지 못함
- Graceful shutdown 처리 부족

---

## ✅ 해결 방법

### 1단계: 코드 수정 완료

**수정된 파일:**
- `railway-backend/src/app.ts`

**변경 사항:**
1. **루트 경로(`/`) 헬스체크 추가** - Railway가 루트 경로로 헬스체크할 수 있도록
2. **헬스체크 응답 개선** - 서비스 정보 포함
3. **서버 바인딩 개선** - `0.0.0.0`으로 명시적 바인딩
4. **Graceful shutdown 처리** - SIGTERM/SIGINT 신호 처리

---

## 🚀 배포 방법

### Git 커밋 및 푸시

**PowerShell 또는 Git Bash에서:**

```powershell
# 프로젝트 디렉토리로 이동
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

# 변경사항 확인
git status

# 변경사항 추가
git add railway-backend/src/app.ts

# 커밋
git commit -m "Fix: Improve health check and server stability for Railway"

# 푸시
git push origin main
```

Railway가 자동으로 재배포합니다.

---

## 🔍 배포 후 확인

### 1단계: Railway 로그 확인

**Railway 대시보드 → OUSCARAVAN → Logs:**

**성공 시 예상 로그:**
```
Testing database connection...
Database client connected
Database connected successfully
Server is running on port 8080
Environment: production
Health check: http://0.0.0.0:8080/health
```

**서버가 계속 실행 중이어야 합니다** (Stopping Container 메시지가 없어야 함)

### 2단계: Health Check 테스트

**브라우저에서:**
```
https://ouscaravan-production.up.railway.app/
https://ouscaravan-production.up.railway.app/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "service": "OUSCARAVAN API",
  "version": "1.0.0"
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

### 문제 1: 여전히 서버가 종료됨

**확인:**
- Railway 대시보드 → OUSCARAVAN → Settings → Health Check Path
- Health Check Path가 `/` 또는 `/health`로 설정되어 있는지 확인

**해결:**
- Railway 대시보드 → Settings → Health Check Path를 `/` 또는 `/health`로 설정
- 또는 Health Check를 비활성화 (권장하지 않음)

### 문제 2: Health Check는 성공하지만 로그인이 안 됨

**확인:**
- Vercel 환경 변수 `NEXT_PUBLIC_API_URL` 확인
- Railway API URL과 일치하는지 확인

**해결:**
- Vercel 환경 변수 업데이트
- Vercel 재배포

### 문제 3: 데이터베이스 연결 실패

**확인:**
- Railway 로그에서 "Database connected successfully" 메시지 확인
- Railway 환경 변수 `DATABASE_URL` 확인

**해결:**
- Railway 대시보드 → Postgres → Variables → `DATABASE_URL` 확인
- OUSCARAVAN 서비스에 Postgres 서비스 연결 확인

---

## 📋 Railway 설정 확인

### Health Check 설정

**Railway 대시보드 → OUSCARAVAN → Settings:**

- **Health Check Path**: `/` 또는 `/health` (또는 비활성화)
- **Health Check Port**: `8080` (또는 Railway가 자동 할당한 포트)

### 서비스 연결 확인

**Railway 대시보드 → OUSCARAVAN → Variables:**

- `DATABASE_URL` 변수가 자동으로 설정되어 있어야 함
- Postgres 서비스가 연결되어 있어야 함

---

## 📋 체크리스트

- [x] 코드 수정 완료
- [ ] Git 커밋 및 푸시
- [ ] Railway 자동 재배포 완료 대기
- [ ] Railway 로그에서 "Server is running" 확인
- [ ] Railway 로그에서 "Stopping Container" 메시지 없음 확인
- [ ] Health Check 테스트 성공 (`/` 또는 `/health`)
- [ ] 로그인 API 테스트 성공
- [ ] Vercel 로그인 테스트 성공

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
