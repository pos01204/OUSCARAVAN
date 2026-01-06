# Railway-Vercel 연결 확인 가이드

## ✅ 현재 설정 확인 완료

**Railway API URL:**
- `https://ouscaravan-production.up.railway.app` ✅

**Vercel 환경 변수:**
- `NEXT_PUBLIC_API_URL=https://ouscaravan-production.up.railway.app` ✅

**설정 상태:** 올바르게 설정되어 있습니다! ✅

---

## 🔍 다음 단계: 연결 테스트

### 1단계: Railway 서버 상태 확인

**Railway 대시보드 → OUSCARAVAN → Logs:**

**확인할 내용:**
- 서버가 계속 실행 중인지 확인
- "Stopping Container" 메시지가 없는지 확인
- "Server is running on port 8080" 메시지 확인

**예상 로그:**
```
Testing database connection...
Database client connected
Database connected successfully
Server is running on port 8080
Environment: production
Health check: http://0.0.0.0:8080/health
```

**문제가 있다면:**
- "Stopping Container" 메시지가 보이면 서버가 종료되고 있는 것
- Railway 헬스체크 실패 가능성

---

### 2단계: Health Check 테스트

**브라우저에서 직접 접속:**

```
https://ouscaravan-production.up.railway.app/health
```

또는

```
https://ouscaravan-production.up.railway.app/
```

**성공 시 응답:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "service": "OUSCARAVAN API",
  "version": "1.0.0"
}
```

**실패 시:**
- 서버가 실행 중이지 않음
- Railway 서버 재배포 필요

---

### 3단계: 로그인 API 직접 테스트

**PowerShell에서:**

```powershell
curl -X POST https://ouscaravan-production.up.railway.app/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"id\":\"ouscaravan\",\"password\":\"123456789a\"}'
```

**성공 시 응답:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800
}
```

**실패 시:**
- 서버가 실행 중이지 않음
- 또는 API 엔드포인트 문제

---

### 4단계: Vercel 재배포 확인

**중요:** 환경 변수를 변경한 후 Vercel이 재배포되었는지 확인:

**Vercel 대시보드 → Deployments:**

1. 최신 배포 확인
2. 배포 시간이 환경 변수 변경 시간 이후인지 확인
3. 배포 상태가 "Ready"인지 확인

**재배포가 필요하다면:**
1. Vercel 대시보드 → 프로젝트 → Deployments
2. 최신 배포의 "..." 메뉴 클릭
3. "Redeploy" 선택
4. 배포 완료 대기

---

### 5단계: Vercel Functions 로그 확인

**Vercel 대시보드 → Functions → Logs:**

로그인 시도 시 다음 로그 확인:
- `Login error:` 메시지
- `API URL:` 실제 사용된 URL
- 에러 상세 정보

**예상 로그 (성공 시):**
```
API URL: https://ouscaravan-production.up.railway.app
```

**예상 로그 (실패 시):**
```
Login error: [에러 메시지]
API URL: https://ouscaravan-production.up.railway.app
Error details: [상세 에러]
```

---

## 🐛 문제 해결

### 문제 1: Health Check 실패

**증상:**
- 브라우저에서 `/health` 접속 시 연결 실패
- 또는 타임아웃

**해결:**
1. Railway 대시보드 → OUSCARAVAN → Logs 확인
2. 서버가 실행 중인지 확인
3. 서버가 종료되고 있다면 Railway 재배포
4. Railway Settings → Health Check Path 확인

### 문제 2: Health Check는 성공하지만 로그인 API 실패

**증상:**
- `/health`는 성공
- `/api/auth/login`은 실패

**해결:**
1. Railway 로그에서 API 요청 확인
2. CORS 설정 확인
3. JWT_SECRET 환경 변수 확인

### 문제 3: Vercel에서 여전히 네트워크 오류

**증상:**
- Railway API는 정상 작동
- Vercel 로그인 시 네트워크 오류

**해결:**
1. Vercel 재배포 확인
2. Vercel Functions 로그 확인
3. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
4. 시크릿 모드에서 테스트

---

## 📋 체크리스트

- [x] Railway API URL 확인: `https://ouscaravan-production.up.railway.app`
- [x] Vercel 환경 변수 확인: `NEXT_PUBLIC_API_URL` 설정됨
- [ ] Railway 서버 로그 확인 (서버 실행 중인지)
- [ ] Health Check 테스트 (`/health`)
- [ ] 로그인 API 테스트 (`/api/auth/login`)
- [ ] Vercel 재배포 확인
- [ ] Vercel Functions 로그 확인
- [ ] 브라우저 캐시 삭제 후 로그인 테스트

---

**다음 단계:**
1. Railway 로그에서 서버 상태 확인
2. Health Check 테스트
3. 로그인 API 직접 테스트
4. 결과를 알려주시면 추가로 도와드리겠습니다!

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
