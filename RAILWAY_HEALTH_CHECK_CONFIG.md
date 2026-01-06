# Railway 헬스체크 설정 가이드

## ❌ 문제: 서버가 시작 후 곧바로 종료됨

**증상:**
- 데이터베이스 연결 성공: "Database connected successfully"
- 서버 시작 성공: "Server is running on port 8080"
- 곧바로 종료: "Stopping Container" → SIGTERM

**원인:**
- Railway 헬스체크 실패
- 헬스체크 경로가 잘못 설정됨
- 헬스체크 타임아웃

---

## ✅ 해결 방법

### 방법 1: Railway 헬스체크 비활성화 (가장 빠른 해결책)

**Railway 대시보드 → OUSCARAVAN 서비스:**

1. **"Settings"** 탭 클릭
2. **"Health Check"** 섹션 찾기
3. **"Disable Health Check"** 또는 **"Health Check Path"**를 비워두기
4. **저장**

**또는:**

1. **"Settings"** 탭 → **"Networking"** 섹션
2. **"Health Check"** 설정 찾기
3. 비활성화 또는 경로를 `/` 또는 `/health`로 설정

---

### 방법 2: Railway 헬스체크 경로 설정

**Railway 대시보드 → OUSCARAVAN 서비스:**

1. **"Settings"** 탭 클릭
2. **"Health Check"** 섹션 찾기
3. **"Health Check Path"** 설정:
   - `/` 또는 `/health`
4. **"Health Check Port"** 설정:
   - `8080` (또는 Railway가 할당한 포트)
5. **저장**

---

### 방법 3: 코드에서 헬스체크 응답 개선

현재 코드는 이미 루트 경로(`/`)와 `/health` 경로에 헬스체크를 제공하고 있습니다.

**확인 사항:**
- `app.get('/', ...)` - 루트 경로 헬스체크 ✅
- `app.get('/health', ...)` - `/health` 경로 헬스체크 ✅
- 서버가 `0.0.0.0`으로 바인딩됨 ✅

---

## 🔍 Railway 헬스체크 설정 위치

### Railway 대시보드에서 찾기

**방법 1: Settings 탭**
1. Railway 대시보드 → OUSCARAVAN 서비스
2. **"Settings"** 탭 클릭
3. **"Health Check"** 또는 **"Networking"** 섹션 찾기

**방법 2: Service Settings**
1. Railway 대시보드 → OUSCARAVAN 서비스
2. 서비스 이름 옆 **"⚙️"** 아이콘 클릭
3. **"Health Check"** 설정 찾기

**방법 3: Railway CLI**
```bash
railway variables set HEALTHCHECK_PATH=/
railway variables set HEALTHCHECK_PORT=8080
```

---

## 🐛 문제 해결

### 문제 1: 헬스체크 설정을 찾을 수 없음

**해결:**
- Railway의 일부 버전에서는 헬스체크가 자동으로 비활성화되어 있을 수 있습니다
- 서비스가 계속 종료된다면, 다른 원인을 확인해야 합니다

### 문제 2: 헬스체크를 비활성화했지만 여전히 종료됨

**확인 사항:**
1. Railway 로그에서 다른 에러 메시지 확인
2. 서버가 실제로 요청을 처리할 수 있는지 확인
3. Railway 서비스 리소스 제한 확인

### 문제 3: 헬스체크는 성공하지만 서버가 종료됨

**확인 사항:**
1. Railway 서비스 리소스 제한 (메모리, CPU)
2. Railway 서비스 타임아웃 설정
3. Railway 서비스 재시작 정책

---

## 📋 체크리스트

- [ ] Railway 대시보드 → OUSCARAVAN → Settings → Health Check 확인
- [ ] 헬스체크 비활성화 또는 경로 설정 (`/` 또는 `/health`)
- [ ] OUSCARAVAN 서비스 재배포
- [ ] Railway 로그에서 "Stopping Container" 메시지가 사라졌는지 확인
- [ ] 서버가 계속 실행 중인지 확인
- [ ] Health Check 테스트 (`/health`)
- [ ] 로그인 API 테스트 (`/api/auth/login`)

---

## 🚀 빠른 해결 방법

### 단계별 가이드:

1. **Railway 대시보드 → OUSCARAVAN 서비스**
2. **"Settings"** 탭 클릭
3. **"Health Check"** 또는 **"Networking"** 섹션 찾기
4. **헬스체크 비활성화** 또는 **경로를 `/`로 설정**
5. **저장**
6. **"Deployments"** 탭 → **"Redeploy"** 클릭
7. **로그 확인:**
   - "Stopping Container" 메시지가 사라졌는지 확인
   - 서버가 계속 실행 중인지 확인

---

## 💡 추가 확인 사항

### Railway 서비스 리소스 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Metrics:**

1. 메모리 사용량 확인
2. CPU 사용량 확인
3. 리소스 제한에 도달했는지 확인

### Railway 서비스 로그 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Logs:**

1. "Stopping Container" 메시지 전의 로그 확인
2. 에러 메시지 확인
3. 타임아웃 메시지 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
