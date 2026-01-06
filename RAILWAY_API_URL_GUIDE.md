# Railway API URL 확인 가이드

## 🔍 Railway API URL 확인 방법

### 방법 1: Railway 대시보드에서 확인 (가장 쉬운 방법)

1. **Railway 대시보드 접속**
   - https://railway.app 접속 및 로그인

2. **프로젝트 선택**
   - OUSCARAVAN 프로젝트 선택

3. **서비스 선택**
   - OUSCARAVAN API 서비스 선택 (Node.js 서비스)

4. **Settings 탭 클릭**
   - 서비스 상세 페이지에서 "Settings" 탭 선택

5. **Domains 섹션 확인**
   - "Domains" 또는 "Public Domain" 섹션에서 확인
   - 예: `ouscaravan-production.up.railway.app`
   - 또는 `https://ouscaravan-production.up.railway.app`

6. **또는 Deployments 탭에서 확인**
   - "Deployments" 탭 → 최신 배포 선택
   - 배포 상세 페이지에서 "Public URL" 확인

---

### 방법 2: Railway 서비스 상세 페이지에서 확인

1. **Railway 대시보드 → OUSCARAVAN 프로젝트**
2. **OUSCARAVAN 서비스 클릭**
3. **상단에 표시된 URL 확인**
   - 서비스 이름 옆에 공개 URL이 표시됨
   - 예: `https://ouscaravan-production.up.railway.app`

---

### 방법 3: Railway Variables에서 확인

1. **Railway 대시보드 → OUSCARAVAN 서비스**
2. **Variables 탭 클릭**
3. **`RAILWAY_PUBLIC_DOMAIN` 환경 변수 확인** (있는 경우)
   - Railway가 자동으로 설정하는 경우도 있음

---

### 방법 4: Health Check로 테스트

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

---

## 📋 현재 설정된 URL 확인

### Vercel 환경 변수에서 확인

**Vercel 대시보드 → Project Settings → Environment Variables:**

1. `NEXT_PUBLIC_API_URL` 변수 확인
2. 값이 Railway API URL과 일치하는지 확인

**예상 값:**
```
https://ouscaravan-production.up.railway.app
```

또는

```
https://ouscaravan-api.railway.app
```

---

## 🔧 URL 형식

Railway 서비스 URL은 일반적으로 다음 형식 중 하나입니다:

1. **프로덕션 도메인:**
   ```
   https://[서비스명]-production.up.railway.app
   ```

2. **커스텀 도메인:**
   ```
   https://[커스텀-도메인].railway.app
   ```

3. **프로젝트 기반:**
   ```
   https://[프로젝트명]-[서비스명].railway.app
   ```

---

## ✅ 확인 체크리스트

- [ ] Railway 대시보드에서 서비스 URL 확인
- [ ] Health Check 엔드포인트 테스트 (`/health` 또는 `/`)
- [ ] Vercel 환경 변수 `NEXT_PUBLIC_API_URL` 확인
- [ ] 두 URL이 일치하는지 확인
- [ ] 로그인 API 테스트 (`/api/auth/login`)

---

## 🐛 문제 해결

### 문제 1: URL을 찾을 수 없음

**해결:**
- Railway 대시보드 → 서비스 → Settings → Domains
- 또는 서비스 상세 페이지 상단의 URL 확인
- Health Check로 직접 테스트

### 문제 2: URL이 변경됨

**해결:**
1. Railway 대시보드에서 새 URL 확인
2. Vercel 환경 변수 `NEXT_PUBLIC_API_URL` 업데이트
3. Vercel 재배포

### 문제 3: Health Check 실패

**확인:**
- Railway 서비스가 "Running" 상태인지 확인
- Railway 로그에서 에러 확인
- 포트 설정 확인

---

## 📸 스크린샷 가이드

### Railway 대시보드에서 URL 확인하는 위치:

1. **프로젝트 목록 페이지**
   - 각 서비스 옆에 URL 표시

2. **서비스 상세 페이지**
   - 상단 헤더에 URL 표시
   - 또는 "Settings" → "Domains" 섹션

3. **Deployments 탭**
   - 각 배포의 "Public URL" 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
