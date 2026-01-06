# Railway SIGTERM 종료 문제 최종 해결

## 🔍 문제 분석

**디버깅 결과:**
- ✅ 환경 변수 정상: `NEXT_PUBLIC_API_URL` 설정됨
- ✅ Health check 성공: Railway 서버 정상 작동 (200 OK)
- ✅ Login API 응답: 401 (정상, 테스트 자격증명 사용)
- ❌ Railway 로그: 서버 시작 후 곧바로 "Stopping Container" → SIGTERM

**핵심 문제:**
- Railway가 배포 후 내부 헬스체크를 수행하는데, 서버가 완전히 준비되기 전에 헬스체크가 실패하면 컨테이너를 종료시킴
- 데이터베이스 연결 테스트가 서버 시작을 지연시킴

---

## ✅ 해결 방법

### 1단계: 서버 시작 순서 변경 (완료)

**수정된 파일:** `railway-backend/src/app.ts`

**변경 사항:**
1. **서버를 먼저 시작**: Railway 헬스체크를 빠르게 응답하기 위해
2. **데이터베이스 연결을 비동기로**: 서버 시작을 막지 않음
3. **에러 핸들링 개선**: 데이터베이스 연결 실패해도 서버는 계속 실행

**이전 순서:**
```
1. 데이터베이스 연결 테스트 (동기, 서버 시작 지연)
2. 서버 시작
3. Railway 헬스체크 대기
```

**새 순서:**
```
1. 서버 시작 (즉시)
2. Railway 헬스체크 즉시 응답 가능
3. 데이터베이스 연결 (비동기, 서버 시작을 막지 않음)
```

---

### 2단계: Railway 헬스체크 설정 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Settings:**

1. **Health Check 설정 확인:**
   - Health Check Path: `/` 또는 `/health`
   - Health Check Port: `8080` (또는 Railway가 할당한 포트)
   - Health Check Timeout: 충분히 긴 시간 (예: 30초)

2. **Health Check 비활성화 (선택사항):**
   - Health Check를 비활성화하면 헬스체크 실패로 인한 종료를 방지할 수 있음
   - 하지만 서버 상태 모니터링이 어려워짐

---

### 3단계: Railway 배포 설정 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Settings:**

1. **Restart Policy:**
   - "On Failure" 또는 "Always" 확인
   - 필요시 조정

2. **Deployment 설정:**
   - 배포 타임아웃 확인
   - 충분히 긴 시간 설정 (예: 5분)

---

## 🚀 배포 방법

### Git 커밋 및 푸시

**PowerShell에서:**

```powershell
# 프로젝트 디렉토리로 이동
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

# 변경사항 확인
git status

# 변경사항 추가
git add railway-backend/src/app.ts

# 커밋
git commit -m "Fix: Improve server startup order for Railway health check"

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
Server is running on port 8080
Environment: production
Health check: http://0.0.0.0:8080/health
Server ready to accept connections
HTTP server is listening and ready
Server startup complete, keeping process alive
Database connected successfully
```

**중요:**
- "Stopping Container" 메시지가 **없어야** 함
- 서버가 계속 실행 중이어야 함

---

### 2단계: Health Check 테스트

**브라우저에서:**
```
https://ouscaravan-production.up.railway.app/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-06T06:53:38.901Z",
  "service": "OUSCARAVAN API",
  "version": "1.0.0"
}
```

---

### 3단계: 로그인 테스트

**Vercel 로그인 페이지:**
```
https://ouscaravan.vercel.app/login
```

**테스트:**
- ID: `ouscaravan`
- Password: `123456789a`

**예상 결과:**
- 로그인 성공
- 관리자 대시보드로 리다이렉트

---

## 🐛 문제 해결

### 문제 1: 여전히 "Stopping Container" 메시지가 나타남

**원인:**
- Railway 헬스체크 설정 문제
- Railway 배포 프로세스 문제

**해결:**
1. Railway 대시보드 → Settings → Health Check 비활성화
2. Railway 대시보드 → Settings → Restart Policy 확인
3. Railway 대시보드 → Metrics → 리소스 사용량 확인

---

### 문제 2: 데이터베이스 연결 실패

**원인:**
- 데이터베이스 연결이 비동기로 처리되어 실패했을 수 있음

**해결:**
1. Railway 로그에서 데이터베이스 연결 에러 확인
2. Railway 대시보드 → Variables → `DATABASE_URL` 확인
3. Railway PostgreSQL 서비스 상태 확인

**참고:**
- 데이터베이스 연결 실패해도 서버는 계속 실행됨
- 하지만 API 기능은 제한될 수 있음

---

### 문제 3: 로그인이 여전히 실패

**원인:**
- Railway 서버가 실제로 종료됨
- 네트워크 연결 문제

**해결:**
1. Railway 로그 확인
2. Health check 직접 테스트
3. 디버깅 엔드포인트 사용: `/api/debug`

---

## 📋 체크리스트

### Railway 설정 확인:

- [ ] Railway 대시보드 → Settings → Health Check Path: `/` 또는 `/health`
- [ ] Railway 대시보드 → Settings → Health Check Port: `8080`
- [ ] Railway 대시보드 → Settings → Health Check Timeout: 충분히 긴 시간
- [ ] Railway 대시보드 → Settings → Restart Policy 확인

### 배포 후 확인:

- [ ] Railway 로그에서 "Stopping Container" 메시지 없음
- [ ] Railway 로그에서 "Server startup complete" 메시지 확인
- [ ] Health check 직접 테스트 성공
- [ ] 로그인 테스트 성공

---

## 💡 핵심 개선 사항

1. **서버 시작 순서 최적화:**
   - 서버를 먼저 시작하여 Railway 헬스체크에 빠르게 응답
   - 데이터베이스 연결을 비동기로 처리하여 서버 시작을 지연시키지 않음

2. **에러 핸들링 개선:**
   - 데이터베이스 연결 실패해도 서버는 계속 실행
   - Railway 헬스체크는 성공할 수 있음

3. **로깅 개선:**
   - 서버 상태를 명확하게 로깅
   - 문제 진단이 쉬워짐

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
