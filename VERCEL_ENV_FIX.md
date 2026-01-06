# Vercel 환경 변수 설정 가이드

## ❌ 문제: Vercel에서 Railway API 연결 실패

**증상:**
- Railway API는 정상 작동 중 (Health Check 성공, 로그인 API 200 OK)
- Vercel 프론트엔드에서 "네트워크 오류" 메시지 표시
- "Railway API 서버에 연결할 수 없습니다" 오류

**원인:**
- Vercel 환경 변수 `NEXT_PUBLIC_API_URL`이 설정되지 않았거나 잘못 설정됨

---

## ✅ 해결 방법: Vercel 환경 변수 설정

### 1단계: Vercel 대시보드 접속

1. https://vercel.com 접속
2. 프로젝트 선택: `ouscaravan` (또는 해당 프로젝트)
3. **"Settings"** 탭 클릭
4. **"Environment Variables"** 메뉴 선택

### 2단계: 환경 변수 추가

**환경 변수 추가:**

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://ouscaravan-production.up.railway.app` | Production, Preview, Development |

**설정 방법:**
1. **"Add New"** 버튼 클릭
2. **Name**: `NEXT_PUBLIC_API_URL` 입력
3. **Value**: `https://ouscaravan-production.up.railway.app` 입력
4. **Environment**: Production, Preview, Development 모두 선택
5. **"Save"** 클릭

### 3단계: 재배포

환경 변수를 추가한 후 자동으로 재배포되거나, 수동으로 재배포:

1. Vercel 대시보드 → 프로젝트 → **"Deployments"** 탭
2. 최신 배포의 **"..."** 메뉴 클릭
3. **"Redeploy"** 선택
4. 배포 완료 대기

---

## 🔍 현재 설정 확인

### Vercel에서 확인

1. Vercel 대시보드 → 프로젝트 → **"Settings"** → **"Environment Variables"**
2. `NEXT_PUBLIC_API_URL` 변수가 있는지 확인
3. 값이 `https://ouscaravan-production.up.railway.app`인지 확인

### 코드에서 확인

**`lib/constants.ts` 파일:**

```typescript
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  // ...
};
```

환경 변수가 설정되지 않으면 기본값 `http://localhost:8080`을 사용합니다.

---

## 📋 환경 변수 목록

**Vercel에 설정해야 할 환경 변수:**

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NEXT_PUBLIC_API_URL` | `https://ouscaravan-production.up.railway.app` | Railway API 서버 URL |
| `N8N_WEBHOOK_URL` | (n8n 웹훅 URL) | n8n 웹훅 URL (선택사항) |

---

## ✅ 설정 후 확인

### 1단계: 재배포 완료 대기

Vercel 재배포가 완료될 때까지 대기 (보통 1-2분)

### 2단계: 로그인 테스트

1. **Vercel 로그인 페이지 접속:**
   ```
   https://ouscaravan.vercel.app/login
   ```

2. **로그인 시도:**
   - ID: `ouscaravan`
   - Password: `123456789a`

3. **성공 시:**
   - 관리자 대시보드로 이동
   - 네트워크 오류 메시지가 사라짐

### 3단계: 브라우저 콘솔 확인

1. 브라우저 개발자 도구 열기 (F12)
2. **"Console"** 탭 확인
3. 에러 메시지가 없는지 확인

---

## 🐛 문제 해결

### 문제 1: 환경 변수가 적용되지 않음

**해결:**
1. Vercel 재배포 확인
2. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
3. 시크릿 모드에서 테스트

### 문제 2: 여전히 네트워크 오류

**해결:**
1. Vercel 환경 변수 값 확인
2. Railway API URL이 올바른지 확인
3. Railway 서버가 실행 중인지 확인
4. 브라우저 개발자 도구 → Network 탭에서 실제 요청 URL 확인

### 문제 3: CORS 오류

**해결:**
- Railway 서버의 CORS 설정 확인
- `railway-backend/src/app.ts`에서 CORS 설정 확인

---

## 📝 체크리스트

- [ ] Vercel 환경 변수 `NEXT_PUBLIC_API_URL` 설정
- [ ] 값: `https://ouscaravan-production.up.railway.app`
- [ ] Production, Preview, Development 모두 선택
- [ ] Vercel 재배포 완료
- [ ] 로그인 페이지에서 네트워크 오류 메시지 사라짐
- [ ] 로그인 성공
- [ ] 관리자 대시보드 접근 가능

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
