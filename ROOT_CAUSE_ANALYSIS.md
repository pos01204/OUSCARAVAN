# 근본 원인 분석 및 해결 가이드

## 🔍 문제 상황

1. **Vercel Functions 로그가 보이지 않음**
   - 서버 액션 실행 시 로그가 표시되지 않음
   - 에러 원인 파악 불가

2. **로그인 시 network_error 발생**
   - Railway API 연결 실패
   - 동일한 문제가 반복됨

3. **환경 변수 확인 어려움**
   - 실제 설정값 확인 불가
   - 빌드 시점과 런타임 값 불일치 가능성

---

## 🎯 근본 원인 분석

### 원인 1: Vercel Functions 로그가 표시되지 않는 이유

**문제:**
- Next.js 서버 액션의 `console.log`가 Vercel Functions 로그에 표시되지 않을 수 있음
- 에러가 발생해도 로그가 기록되지 않을 수 있음

**해결:**
- 로깅 개선: 더 자세한 로그 추가
- 에러 핸들링 개선: 모든 에러를 명확하게 로깅
- 환경 변수 검증: 실제 설정값 확인

---

### 원인 2: Railway API 연결 실패

**가능한 원인들:**

1. **환경 변수 미설정 또는 잘못된 값**
   - `NEXT_PUBLIC_API_URL`이 Vercel에 설정되지 않음
   - 빌드 시점에 환경 변수가 포함되지 않음
   - 런타임에 환경 변수가 다름

2. **Railway 서버가 실제로 종료됨**
   - 서버가 시작 후 곧바로 종료
   - Health check 실패
   - 네트워크 연결 불가

3. **CORS 문제**
   - Railway CORS 설정이 Vercel 도메인을 허용하지 않음
   - Preflight 요청 실패

4. **타임아웃**
   - Railway 서버 응답이 너무 느림
   - 네트워크 지연

---

## ✅ 해결 방법

### 1단계: 로깅 개선 (완료)

**수정된 파일:** `lib/auth.ts`

**개선 사항:**
- 모든 단계에서 상세한 로그 추가
- 환경 변수 값 로깅
- 요청/응답 정보 로깅
- 에러 상세 정보 로깅

**로그 예시:**
```
[LOGIN] Starting login process
[LOGIN] Environment check: { hasApiUrl: true, apiUrlFromEnv: '...', ... }
[LOGIN] Sending request to: https://...
[LOGIN] Response received: { status: 200, ... }
[LOGIN] Login successful
```

**확인 방법:**
- Vercel 대시보드 → 프로젝트 → Functions → Logs
- 로그인 시도 후 로그 확인

---

### 2단계: 환경 변수 검증

**확인 사항:**

1. **Vercel 환경 변수 설정:**
   - Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
   - `NEXT_PUBLIC_API_URL` 확인
   - 값: `https://ouscaravan-production.up.railway.app`

2. **빌드 시점 확인:**
   - 환경 변수가 빌드 시점에 포함되는지 확인
   - `NEXT_PUBLIC_*` 변수는 빌드 시점에 포함됨

3. **런타임 확인:**
   - 디버깅 엔드포인트 사용: `/api/debug`
   - 실제 사용되는 값 확인

---

### 3단계: 디버깅 엔드포인트 사용

**새로 추가된 파일:** `app/api/debug/route.ts`

**사용 방법:**

1. **브라우저에서 접속:**
   ```
   https://ouscaravan.vercel.app/api/debug
   ```

2. **응답 확인:**
   ```json
   {
     "timestamp": "2024-01-15T12:00:00.000Z",
     "environment": {
       "NODE_ENV": "production",
       "NEXT_PUBLIC_API_URL": "https://ouscaravan-production.up.railway.app",
       "API_URL_FROM_CONFIG": "https://ouscaravan-production.up.railway.app"
     },
     "urls": {
       "login": "https://ouscaravan-production.up.railway.app/api/auth/login",
       "health": "https://ouscaravan-production.up.railway.app/health"
     },
     "tests": {
       "health": {
         "success": true,
         "status": 200,
         "duration": "123ms"
       },
       "login": {
         "success": false,
         "status": 401,
         "duration": "234ms"
       }
     }
   }
   ```

3. **확인할 내용:**
   - `environment.NEXT_PUBLIC_API_URL`: 실제 설정값
   - `tests.health.success`: Railway Health check 성공 여부
   - `tests.login.status`: Railway Login API 응답 상태

---

### 4단계: Railway API 연결 테스트

**방법 1: 디버깅 엔드포인트 사용**

```
https://ouscaravan.vercel.app/api/debug
```

**방법 2: 브라우저 개발자 도구**

1. 로그인 페이지에서 F12 (개발자 도구 열기)
2. **Network** 탭 선택
3. 로그인 시도
4. 요청 확인:
   - URL: `https://ouscaravan-production.up.railway.app/api/auth/login`
   - 상태 코드: 200, 401, 500, 또는 네트워크 오류
   - 응답 본문 확인

**방법 3: Railway 로그 확인**

1. Railway 대시보드 → OUSCARAVAN 서비스 → Logs
2. 로그인 시도 시 요청 로그 확인
3. 에러 메시지 확인

---

## 🔧 문제별 해결 방법

### 문제 1: NEXT_PUBLIC_API_URL이 "NOT SET"으로 표시됨

**원인:**
- Vercel 환경 변수가 설정되지 않음
- 빌드 시점에 환경 변수가 포함되지 않음

**해결:**
1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. `NEXT_PUBLIC_API_URL` 추가/수정
3. 값: `https://ouscaravan-production.up.railway.app`
4. Environment: Production, Preview, Development 모두 선택
5. 재배포

---

### 문제 2: Health check 실패

**원인:**
- Railway 서버가 실행되지 않음
- Railway 서버가 종료됨
- 네트워크 연결 불가

**해결:**
1. Railway 대시보드 → OUSCARAVAN 서비스 → Logs
2. 서버 상태 확인
3. Health check 직접 테스트:
   ```
   https://ouscaravan-production.up.railway.app/health
   ```
4. 서버 재배포 (필요시)

---

### 문제 3: Login API가 401 응답

**원인:**
- 인증 실패 (ID/비밀번호 불일치)
- Railway 서버는 정상 작동 중

**해결:**
- 정상적인 동작
- 올바른 ID/비밀번호 사용

---

### 문제 4: Login API가 네트워크 오류

**원인:**
- Railway 서버가 실행되지 않음
- 타임아웃
- CORS 문제

**해결:**
1. Railway 서버 상태 확인
2. Health check 테스트
3. CORS 설정 확인 (Railway)
4. 네트워크 연결 확인

---

## 📋 체크리스트

### 환경 변수 확인:

- [ ] Vercel 대시보드 → Settings → Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` 존재 확인
- [ ] 값이 `https://ouscaravan-production.up.railway.app`인지 확인
- [ ] Production 환경에 적용되어 있는지 확인

### Railway 서버 확인:

- [ ] Railway 대시보드 → OUSCARAVAN 서비스 → 서비스 상태 "Online" 확인
- [ ] Railway 로그에서 "Server is running" 메시지 확인
- [ ] Health check 직접 테스트: `https://ouscaravan-production.up.railway.app/health`
- [ ] Login API 직접 테스트 (브라우저 개발자 도구)

### 디버깅:

- [ ] `/api/debug` 엔드포인트 접속
- [ ] 환경 변수 값 확인
- [ ] Health check 테스트 결과 확인
- [ ] Login API 테스트 결과 확인
- [ ] Vercel Functions 로그 확인 (로그인 시도 후)

---

## 🚀 다음 단계

1. **디버깅 엔드포인트 사용:**
   - `https://ouscaravan.vercel.app/api/debug` 접속
   - 결과 확인

2. **Vercel Functions 로그 확인:**
   - 로그인 시도
   - Vercel 대시보드 → Functions → Logs
   - `[LOGIN]` 로그 확인

3. **결과에 따른 조치:**
   - 환경 변수 미설정 → Vercel 환경 변수 설정
   - Health check 실패 → Railway 서버 확인
   - 네트워크 오류 → Railway 서버 상태 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
