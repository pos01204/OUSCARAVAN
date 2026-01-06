# 로그인 문제 해결 가이드

## ❌ 문제: 로그인 실패 (네트워크 오류)

**증상:**
- Vercel 로그인 페이지에서 "네트워크 오류" 메시지 표시
- Railway API는 정상 작동 중 (Health Check 성공, 로그인 API 200 OK)

---

## 🔍 원인 분석

### n8n 웹훅 URL과 로그인의 관계

**결론: n8n 웹훅 URL은 로그인과 직접적인 관련이 없습니다.**

- **로그인 기능**: Railway API를 직접 호출 (`/api/auth/login`)
- **n8n 웹훅**: 예약 배정 알림톡 발송 등에만 사용
- 로그인 실패는 n8n 웹훅 URL 설정과 무관합니다

---

## ✅ 로그인 실패 원인 확인

### 1단계: Vercel 환경 변수 확인

**Vercel 대시보드 → Settings → Environment Variables:**

확인 사항:
- [ ] `NEXT_PUBLIC_API_URL`이 설정되어 있는지
- [ ] 값이 `https://ouscaravan-production.up.railway.app`인지
- [ ] Production 환경에 적용되어 있는지

### 2단계: 실제 API URL 확인

**브라우저 개발자 도구에서 확인:**

1. 로그인 페이지에서 F12 (개발자 도구 열기)
2. **"Network"** 탭 선택
3. 로그인 시도
4. 요청 URL 확인:
   - 예상: `https://ouscaravan-production.up.railway.app/api/auth/login`
   - 실제로 호출되는 URL 확인

### 3단계: 서버 사이드 로그 확인

**Vercel 대시보드 → Functions → Logs:**

로그인 시도 시 에러 메시지 확인:
- `Login error:` 로그 확인
- `API URL:` 로그 확인
- 실제 호출되는 API URL 확인

---

## 🔧 해결 방법

### 방법 1: 환경 변수 재확인 및 재배포

1. **Vercel 환경 변수 확인:**
   - `NEXT_PUBLIC_API_URL` 값 확인
   - `https://ouscaravan-production.up.railway.app`인지 확인

2. **재배포:**
   - Vercel 대시보드 → Deployments → Redeploy

3. **브라우저 캐시 삭제:**
   - Ctrl+Shift+Delete
   - 또는 시크릿 모드에서 테스트

### 방법 2: 코드에서 기본값 확인

**`lib/constants.ts` 파일:**

```typescript
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://ouscaravan-api.railway.app',
  // ...
};
```

**문제:**
- 기본값이 `https://ouscaravan-api.railway.app`로 되어 있음
- 실제 Railway URL은 `https://ouscaravan-production.up.railway.app`

**해결:**
- Vercel 환경 변수에 올바른 URL 설정
- 또는 코드의 기본값 수정

### 방법 3: 직접 API 테스트

**PowerShell에서:**

```powershell
# Railway API 직접 테스트
curl -X POST https://ouscaravan-production.up.railway.app/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"id\":\"ouscaravan\",\"password\":\"123456789a\"}'
```

**예상 응답:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📋 n8n 웹훅 URL 설정 (선택사항)

n8n 웹훅 URL은 로그인과 무관하지만, 예약 배정 알림톡 발송에 필요합니다.

### 설정 방법

**Vercel 대시보드 → Settings → Environment Variables:**

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | (n8n 웹훅 URL) | Production, Preview, Development |

**n8n 웹훅 URL 확인:**
1. n8n 대시보드 접속
2. 워크플로우 선택
3. Webhook 노드 클릭
4. Webhook URL 복사

---

## 🐛 문제 해결 체크리스트

### 로그인 실패 시 확인 사항

- [ ] Vercel 환경 변수 `NEXT_PUBLIC_API_URL` 설정 확인
- [ ] 값이 `https://ouscaravan-production.up.railway.app`인지 확인
- [ ] Production 환경에 적용되어 있는지 확인
- [ ] Vercel 재배포 완료
- [ ] 브라우저 캐시 삭제 또는 시크릿 모드 테스트
- [ ] 브라우저 개발자 도구 → Network 탭에서 실제 요청 URL 확인
- [ ] Railway API 직접 테스트 (curl)
- [ ] Vercel Functions 로그 확인

### n8n 웹훅 URL (선택사항)

- [ ] n8n 웹훅 URL 확인
- [ ] Vercel 환경 변수 `NEXT_PUBLIC_N8N_WEBHOOK_URL` 설정
- [ ] 예약 배정 알림톡 발송 테스트

---

## 💡 요약

**로그인 실패 원인:**
- ❌ n8n 웹훅 URL 미설정 (관련 없음)
- ✅ `NEXT_PUBLIC_API_URL` 설정 문제 가능성
- ✅ Vercel 재배포 필요
- ✅ 브라우저 캐시 문제 가능성

**해결 방법:**
1. Vercel 환경 변수 `NEXT_PUBLIC_API_URL` 재확인
2. Vercel 재배포
3. 브라우저 캐시 삭제 후 재시도
4. 브라우저 개발자 도구에서 실제 요청 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
