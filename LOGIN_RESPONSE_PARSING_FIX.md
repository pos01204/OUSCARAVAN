# 로그인 응답 파싱 문제 해결

## 🔍 문제 분석

**증상:**
- Railway 로그: `[AUTH] Login successful` ✅
- Vercel 로그: `[LOGIN] Unknown error, redirecting to network_error` ❌

**원인:**
- Railway에서는 로그인 성공했지만, Vercel에서 응답을 파싱하지 못함
- `response.json()` 파싱 중 에러 발생 가능성
- 응답 본문이 비어있거나 잘못된 형식일 가능성

---

## ✅ 해결 방법

### 1. Vercel 응답 파싱 개선

**파일:** `lib/auth.ts`

**변경 사항:**
- 응답 본문을 먼저 텍스트로 읽기
- 텍스트를 JSON으로 파싱
- 상세한 에러 로깅 추가

**효과:**
- 응답 본문 내용 확인 가능
- 파싱 에러 원인 파악 용이
- 디버깅 시간 단축

---

### 2. Railway 응답 헤더 명시

**파일:** `railway-backend/src/controllers/auth.controller.ts`

**변경 사항:**
- `Content-Type: application/json` 헤더 명시적으로 설정
- 응답 전송 확인 로깅 추가

**효과:**
- 응답 형식 명확화
- 클라이언트에서 올바르게 파싱 가능

---

### 3. 데이터베이스 연결 상태 확인 엔드포인트 추가

**파일:** `railway-backend/src/routes/health.routes.ts` (신규)

**기능:**
- `/health` 엔드포인트에 데이터베이스 연결 상태 포함
- 데이터베이스 연결 실패 시에도 서버는 계속 실행

**효과:**
- 데이터베이스 연결 상태 확인 가능
- 문제 진단 용이

---

## 🚀 다음 단계

### 1. Railway 배포

```bash
cd railway-backend
# Railway에 자동 배포되거나
# 수동으로 Railway 대시보드에서 배포
```

### 2. 테스트

1. **Vercel 로그인 페이지 접속**
2. **로그인 시도** (ID: `ouscaravan`, PW: `123456789a`)
3. **로그 확인:**
   - Vercel Functions 로그: `[LOGIN] Response body (text)` 확인
   - Railway 로그: `[AUTH] Response sent successfully` 확인

### 3. 데이터베이스 연결 확인

**Railway 대시보드에서:**
- Postgres 서비스가 "Online" 상태인지 확인
- OUSCARAVAN 서비스가 Postgres에 연결되어 있는지 확인

**API 호출로 확인:**
```bash
curl https://ouscaravan-production.up.railway.app/health
```

응답 예시:
```json
{
  "status": "ok",
  "timestamp": "2026-01-06T08:44:22.362Z",
  "service": "OUSCARAVAN API",
  "version": "1.0.0",
  "database": {
    "connected": true,
    "error": null
  }
}
```

---

## 📋 예상 로그

### 정상 동작 시:

**Vercel 로그:**
```
[LOGIN] Response received: { status: 200, ... }
[LOGIN] Response body (text): { length: 123, preview: '{"token":"...","expiresIn":604800}' }
[LOGIN] Response data received: { hasToken: true, tokenLength: 184, ... }
[LOGIN] Login successful, redirecting to /admin
```

**Railway 로그:**
```
[AUTH] Login request received: { ... }
[AUTH] Login successful: { id: 'ouscaravan', ... }
[AUTH] Response sent successfully
```

### 문제 발생 시:

**응답 본문이 비어있는 경우:**
```
[LOGIN] Response body (text): { length: 0, isEmpty: true }
[LOGIN] Failed to parse response JSON: { error: 'Response body is empty' }
```

**JSON 파싱 실패:**
```
[LOGIN] Response body (text): { preview: 'Invalid JSON...' }
[LOGIN] Failed to parse response JSON: { error: 'Unexpected token...' }
```

---

## 🔍 데이터베이스 연결 확인

### Railway 대시보드에서:

1. **Postgres 서비스:**
   - 상태: "Online" ✅
   - 볼륨: "postgres-volume" 연결됨 ✅

2. **OUSCARAVAN 서비스:**
   - 상태: "Online" ✅
   - Postgres 연결: 확인 필요

### API로 확인:

```bash
# 헬스체크 (데이터베이스 연결 상태 포함)
curl https://ouscaravan-production.up.railway.app/health
```

**정상 응답:**
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "error": null
  }
}
```

**데이터베이스 연결 실패:**
```json
{
  "status": "degraded",
  "database": {
    "connected": false,
    "error": "Connection timeout"
  }
}
```

---

## 📋 체크리스트

### Railway:
- [x] 응답 헤더 명시적 설정 완료
- [x] 응답 전송 확인 로깅 추가 완료
- [x] 데이터베이스 연결 상태 확인 엔드포인트 추가 완료
- [ ] Railway 배포 완료
- [ ] Railway 로그 확인
- [ ] `/health` 엔드포인트 테스트

### Vercel:
- [x] 응답 파싱 개선 완료
- [x] 상세한 에러 로깅 추가 완료
- [ ] Vercel 재배포 (필요 시)
- [ ] Vercel Functions 로그 확인

### 테스트:
- [ ] 로그인 페이지 접속
- [ ] 로그인 시도
- [ ] Vercel 로그 확인 (`[LOGIN] Response body (text)`)
- [ ] Railway 로그 확인 (`[AUTH] Response sent successfully`)
- [ ] 데이터베이스 연결 확인 (`/health` 엔드포인트)

---

## 🎯 핵심 개선 사항

1. **응답 파싱 개선**: 텍스트로 먼저 읽어서 내용 확인
2. **응답 헤더 명시**: Content-Type 명시적으로 설정
3. **상세 로깅**: 응답 본문 내용까지 로깅
4. **데이터베이스 확인**: 연결 상태 확인 엔드포인트 추가

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
