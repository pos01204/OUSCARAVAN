# Railway 컨테이너 라이프사이클 디버깅

## 🔍 현재 상황 재분석

**확인된 사항:**
- ✅ Health check 성공: `{"status":"ok",...}`
- ✅ 서버가 정상적으로 시작됨: "Server is running on port 8080"
- ✅ 데이터베이스 연결 성공: "Database connected successfully"
- ✅ Railway 설정 (Serverless, Restart Policy 등) 문제없음
- ✅ 리소스 충분함
- ❌ 로그에 "Stopping Container" → SIGTERM 표시

**중요한 관찰:**
- Health check가 성공한다는 것은 **서버가 실제로는 실행 중일 수 있음**
- 로그가 섞여서 나올 수 있음
- Railway의 배포 프로세스 중 일시적인 종료일 수 있음

---

## 🔍 추가 진단 방법

### 방법 1: 실제 서버 상태 확인

**Railway 대시보드 → OUSCARAVAN 서비스:**

1. **서비스 상태 확인:**
   - 서비스가 "Online" 상태인지 확인
   - "Offline" 또는 "Restarting" 상태인지 확인

2. **HTTP Logs 확인:**
   - "HTTP Logs" 또는 "Requests" 탭 확인
   - 실제 요청이 처리되고 있는지 확인
   - Health check 요청이 성공하는지 확인

3. **실제 API 테스트:**
   - 브라우저에서 직접 테스트:
     ```
     https://ouscaravan-production.up.railway.app/health
     ```
   - 로그인 API 테스트:
     ```
     https://ouscaravan-production.up.railway.app/api/auth/login
     ```

---

### 방법 2: Railway 로그 순서 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Logs:**

**로그 순서 분석:**
```
Starting Container
Server is running on port 8080  ← 서버 시작
Environment: production
Health check: http://0.0.0.0:8080/health
npm warn config production...
> node dist/app.js
Testing database connection...  ← 데이터베이스 연결
Database client connected
Database connected successfully
Stopping Container  ← 종료
```

**가능한 시나리오:**
1. **롤링 업데이트**: 새 컨테이너가 시작되면서 기존 컨테이너가 종료됨
2. **로그 순서 문제**: 로그가 섞여서 나옴
3. **실제 종료**: 서버가 실제로 종료됨

---

### 방법 3: Railway 배포 프로세스 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Deployments:**

1. **최신 배포 확인:**
   - 배포 상태 확인
   - 배포가 성공했는지 확인
   - 배포가 계속 반복되는지 확인

2. **배포 로그 확인:**
   - 배포 상세 로그 확인
   - 빌드 성공 여부 확인
   - 배포 완료 여부 확인

---

## 🐛 가능한 원인들

### 원인 1: Railway 롤링 업데이트

**증상:**
- 새 배포가 시작되면 기존 컨테이너가 종료됨
- 로그에 "Stopping Container" 표시
- 하지만 새 컨테이너는 정상 실행 중

**확인 방법:**
- Railway 대시보드 → Deployments
- 여러 배포가 동시에 진행되는지 확인
- 최신 배포가 "Active" 상태인지 확인

**해결 방법:**
- 정상적인 동작이므로 추가 조치 불필요
- 새 컨테이너가 정상 실행 중인지 확인

---

### 원인 2: Railway 헬스체크 (배포 중)

**증상:**
- 배포 중 헬스체크가 실패하면 컨테이너가 종료됨
- 하지만 배포 완료 후 새 컨테이너는 정상 실행

**확인 방법:**
- Railway 대시보드 → Settings → Healthcheck Path
- 배포 중 헬스체크 설정 확인

**해결 방법:**
- 헬스체크 경로를 `/` 또는 `/health`로 설정
- 또는 헬스체크 비활성화

---

### 원인 3: Railway 컨테이너 재시작 루프

**증상:**
- 서버가 시작 → 종료 → 재시작 반복
- 로그에 "Stopping Container" 반복 표시

**확인 방법:**
- Railway 대시보드 → Logs
- "Starting Container"와 "Stopping Container"가 반복되는지 확인

**해결 방법:**
- Railway 대시보드 → Settings → Restart Policy 확인
- "On Failure"로 설정되어 있는지 확인
- 필요시 "Never"로 변경하여 재시작 방지

---

## ✅ 실제 서버 상태 확인 방법

### 1. Health Check 직접 테스트

**브라우저에서:**
```
https://ouscaravan-production.up.railway.app/health
```

**성공 시:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "service": "OUSCARAVAN API",
  "version": "1.0.0"
}
```

**실패 시:**
- 연결 실패 또는 타임아웃
- 서버가 실제로 종료된 것

---

### 2. 로그인 API 직접 테스트

**PowerShell에서:**
```powershell
curl -X POST https://ouscaravan-production.up.railway.app/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"id\":\"ouscaravan\",\"password\":\"123456789a\"}'
```

**성공 시:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800
}
```

**실패 시:**
- 연결 실패 또는 타임아웃
- 서버가 실제로 종료된 것

---

### 3. Railway HTTP Logs 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → HTTP Logs (또는 Requests):**

**확인할 내용:**
- 실제 요청이 처리되고 있는지
- 요청 상태 코드 (200, 404, 500 등)
- 요청 시간

**성공 시:**
- 요청이 정상적으로 처리됨
- 상태 코드 200
- 서버가 실제로 실행 중

**실패 시:**
- 요청이 없음 또는 실패
- 서버가 실제로 종료된 것

---

## 🚀 해결 방법

### 방법 1: Railway 서비스 상태 확인

**Railway 대시보드 → OUSCARAVAN 서비스:**

1. **서비스 상태 확인:**
   - "Online" 상태인지 확인
   - "Offline" 또는 "Restarting" 상태인지 확인

2. **HTTP Logs 확인:**
   - 실제 요청이 처리되고 있는지 확인
   - Health check 요청이 성공하는지 확인

3. **실제 API 테스트:**
   - 브라우저에서 Health check 테스트
   - 로그인 API 테스트

---

### 방법 2: Railway 배포 프로세스 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Deployments:**

1. **최신 배포 확인:**
   - 배포 상태 확인
   - 배포가 성공했는지 확인
   - 배포가 계속 반복되는지 확인

2. **배포 로그 확인:**
   - 배포 상세 로그 확인
   - 빌드 성공 여부 확인
   - 배포 완료 여부 확인

---

### 방법 3: Railway 로그 순서 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Logs:**

1. **로그 시간순 정렬:**
   - 로그가 시간순으로 정렬되어 있는지 확인
   - "Starting Container"와 "Stopping Container" 순서 확인

2. **로그 패턴 확인:**
   - "Starting Container"와 "Stopping Container"가 반복되는지 확인
   - 반복된다면 재시작 루프 가능성

---

## 📋 체크리스트

### 실제 서버 상태 확인:

- [ ] 브라우저에서 Health check 테스트 (`/health`)
- [ ] PowerShell에서 로그인 API 테스트 (`/api/auth/login`)
- [ ] Railway 대시보드 → HTTP Logs 확인
- [ ] Railway 대시보드 → 서비스 상태 확인 ("Online"인지)

### Railway 배포 프로세스 확인:

- [ ] Railway 대시보드 → Deployments → 최신 배포 상태 확인
- [ ] Railway 대시보드 → Deployments → 배포가 반복되는지 확인
- [ ] Railway 대시보드 → Logs → 로그 순서 확인

---

## 💡 다음 단계

1. **실제 서버 상태 확인:**
   - 브라우저에서 Health check 테스트
   - 로그인 API 테스트
   - Railway HTTP Logs 확인

2. **결과에 따른 조치:**
   - **서버가 정상 작동 중이면**: 로그만 이상하게 나오는 것, 문제 없음
   - **서버가 실제로 종료되면**: 추가 진단 필요

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
