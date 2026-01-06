# Vercel 관리자 로그인 네트워크 오류 해결

## 🔍 문제

**증상:**
- 관리자 로그인 페이지에서 "네트워크 오류가 발생했습니다" 메시지 표시
- "Railway API 서버에 연결할 수 없습니다" 에러
- "Vercel 환경 변수에서 NEXT_PUBLIC_API_URL을 확인해주세요" 안내

**원인:**
- Vercel 환경 변수 `NEXT_PUBLIC_API_URL`이 설정되지 않음
- 또는 잘못된 URL이 설정됨
- 또는 Railway API 서버가 응답하지 않음

---

## ✅ 해결 방법

### 1단계: Vercel 환경 변수 확인

**Vercel 대시보드 → 프로젝트 → Settings → Environment Variables:**

1. **`NEXT_PUBLIC_API_URL`** 변수가 있는지 확인
2. 변수가 없다면 생성:
   - **"Add New"** 클릭
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://ouscaravan-production.up.railway.app`
   - **Environment:** `Production`, `Preview`, `Development` 모두 선택
   - **"Save"** 클릭
3. 변수가 있다면 값 확인:
   - 올바른 값: `https://ouscaravan-production.up.railway.app`
   - 잘못된 값 예시:
     - `http://ouscaravan-production.up.railway.app` (https 없음)
     - `https://ouscaravan-production.up.railway.app/` (끝에 슬래시)
     - `https://ouscaravan-api.railway.app` (잘못된 도메인)

---

### 2단계: Vercel 재배포

**환경 변수를 추가/수정한 후:**

1. **Vercel 대시보드** → **프로젝트** → **Deployments**
2. **"Redeploy"** 클릭
3. 또는 **Git에 푸시**하여 자동 재배포

**중요:**
- 환경 변수를 변경한 후에는 **반드시 재배포**해야 합니다
- 환경 변수는 빌드 시점에 주입되므로 재배포가 필요합니다

---

### 3단계: Railway API 서버 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Logs:**

**확인할 내용:**
1. 서버가 실행 중인지 확인
2. Health check 응답 확인:
   - `GET https://ouscaravan-production.up.railway.app/health`
   - 응답: `{"status":"ok",...}`

**브라우저에서 직접 확인:**
1. `https://ouscaravan-production.up.railway.app/health` 접속
2. JSON 응답 확인

---

### 4단계: Vercel Functions 로그 확인

**Vercel 대시보드 → 프로젝트 → Functions → Logs:**

**확인할 내용:**
1. 로그인 시도 시 에러 메시지 확인
2. API 호출 실패 원인 확인
3. 타임아웃 또는 연결 오류 확인

---

## 🔧 문제 해결

### 문제 1: 환경 변수가 설정되지 않음

**증상:**
- Vercel 환경 변수에 `NEXT_PUBLIC_API_URL`이 없음

**해결:**
1. Vercel 대시보드 → Settings → Environment Variables
2. `NEXT_PUBLIC_API_URL` 추가
3. 값: `https://ouscaravan-production.up.railway.app`
4. 재배포

---

### 문제 2: 잘못된 URL

**증상:**
- 환경 변수는 있지만 잘못된 URL

**해결:**
1. 올바른 URL 확인: `https://ouscaravan-production.up.railway.app`
2. 환경 변수 수정
3. 재배포

---

### 문제 3: Railway API 서버가 응답하지 않음

**증상:**
- 환경 변수는 올바르지만 연결 실패

**해결:**
1. Railway 대시보드 → Logs 확인
2. 서버가 실행 중인지 확인
3. Health check 확인: `https://ouscaravan-production.up.railway.app/health`

---

### 문제 4: CORS 오류

**증상:**
- 브라우저 콘솔에서 CORS 에러

**해결:**
1. Railway API의 CORS 설정 확인
2. Vercel 도메인이 허용되어 있는지 확인

---

## 📋 체크리스트

### Vercel 설정:

- [ ] 환경 변수 `NEXT_PUBLIC_API_URL` 생성
- [ ] 값: `https://ouscaravan-production.up.railway.app`
- [ ] Environment: Production, Preview, Development 모두 선택
- [ ] 재배포 완료

### Railway 설정:

- [ ] 서버가 실행 중인지 확인
- [ ] Health check 응답 확인
- [ ] 로그에서 에러 없음 확인

### 테스트:

- [ ] Vercel 사이트 접속
- [ ] 관리자 로그인 페이지 확인
- [ ] 로그인 시도
- [ ] Vercel Functions 로그 확인

---

## 🚀 빠른 해결 단계

1. **Vercel 환경 변수 확인**
   - Vercel 대시보드 → Settings → Environment Variables
   - `NEXT_PUBLIC_API_URL` 확인/생성
   - 값: `https://ouscaravan-production.up.railway.app`

2. **Vercel 재배포**
   - Deployments → Redeploy
   - 또는 Git 푸시

3. **Railway API 확인**
   - `https://ouscaravan-production.up.railway.app/health` 접속
   - JSON 응답 확인

4. **테스트**
   - Vercel 사이트 접속
   - 관리자 로그인 시도
   - Vercel Functions 로그 확인

---

## 🔍 디버깅

### Vercel Functions 로그 확인:

**Vercel 대시보드 → 프로젝트 → Functions → Logs:**

**예상 로그 (성공 시):**
```
[LOGIN] Starting login process
[LOGIN] Environment check: { hasApiUrl: true, apiUrlFromEnv: 'https://ouscaravan-production.up.railway.app', ... }
[LOGIN] Login successful, redirecting to /admin
```

**예상 로그 (실패 시):**
```
[LOGIN] Login error: FetchError: request to https://ouscaravan-production.up.railway.app/api/auth/login failed
[LOGIN] API URL: https://ouscaravan-production.up.railway.app
```

---

## 📋 최종 확인

### Vercel 환경 변수:

- [ ] `NEXT_PUBLIC_API_URL` = `https://ouscaravan-production.up.railway.app`
- [ ] 모든 환경(Production, Preview, Development)에 설정
- [ ] 재배포 완료

### Railway API:

- [ ] 서버 실행 중
- [ ] Health check 응답 확인
- [ ] 로그인 API 응답 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
