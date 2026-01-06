# 로그인 redirect 문제 해결

## 🔍 문제 분석

**증상:**
- Railway 로그: `[AUTH] Login successful`, `[AUTH] Response sent successfully` ✅
- Vercel 로그: `[LOGIN] Unknown error, redirecting to network_error` ❌

**원인:**
- Next.js의 `redirect()` 함수는 내부적으로 예외를 던짐 (`NEXT_REDIRECT`)
- 이 예외가 catch 블록에서 잡혀서 "Unknown error"로 처리됨
- `redirect()` 호출이 try-catch 내부에 있어서 문제 발생

---

## ✅ 해결 방법

### 1. redirect() 호출 방식 변경

**문제:**
- `redirect()`가 try-catch 내부에서 호출되면 예외가 catch 블록에서 잡힘
- Next.js의 `redirect()`는 특별한 에러 타입을 던지는데, 이것이 일반 에러로 처리됨

**해결:**
- 로그인 성공/실패를 명시적인 에러 메시지로 표시
- catch 블록에서 에러 타입에 따라 적절한 redirect 호출
- `redirect()`는 try-catch 밖에서 호출하거나, 명시적인 에러 타입으로 처리

---

### 2. 에러 타입별 처리

**에러 타입:**
- `LOGIN_SUCCESS`: 로그인 성공 → `/admin`으로 redirect
- `AUTH_FAILED`: 인증 실패 → `/login?error=invalid_credentials`로 redirect
- `RESPONSE_READ_FAILED`: 응답 읽기 실패 → `/login?error=network_error`로 redirect
- `JSON_PARSE_FAILED`: JSON 파싱 실패 → `/login?error=network_error`로 redirect
- `NO_TOKEN_IN_RESPONSE`: 토큰 없음 → `/login?error=invalid_credentials`로 redirect

---

## 🚀 변경 사항

### lib/auth.ts

**변경 전:**
```typescript
if (!response.ok) {
  redirect('/login?error=invalid_credentials');
}

// ... 토큰 처리 ...

redirect('/admin');
```

**변경 후:**
```typescript
if (!response.ok) {
  throw new Error('AUTH_FAILED');
}

// ... 토큰 처리 ...

throw new Error('LOGIN_SUCCESS');
```

**catch 블록:**
```typescript
catch (error) {
  if (error instanceof Error && error.message === 'LOGIN_SUCCESS') {
    redirect('/admin');
    return;
  }
  
  if (error instanceof Error && error.message === 'AUTH_FAILED') {
    redirect('/login?error=invalid_credentials');
    return;
  }
  
  // ... 기타 에러 처리 ...
}
```

---

## 📋 예상 동작

### 정상 로그인:

1. Railway에서 로그인 성공
2. Vercel에서 응답 받기
3. 토큰 파싱 및 쿠키 저장
4. `LOGIN_SUCCESS` 에러 던지기
5. catch 블록에서 `/admin`으로 redirect

**예상 로그:**
```
[LOGIN] Response received: { status: 200, ... }
[LOGIN] Response body (text): { length: 123, ... }
[LOGIN] Response data received: { hasToken: true, ... }
[LOGIN] Login successful, redirecting to /admin
```

### 인증 실패:

1. Railway에서 인증 실패 (401)
2. Vercel에서 응답 받기
3. `AUTH_FAILED` 에러 던지기
4. catch 블록에서 `/login?error=invalid_credentials`로 redirect

**예상 로그:**
```
[LOGIN] Response received: { status: 401, ... }
[LOGIN] Authentication failed: { ... }
```

### 네트워크 오류:

1. Railway 연결 실패
2. fetch 에러 발생
3. catch 블록에서 에러 타입 확인
4. `/login?error=network_error`로 redirect

**예상 로그:**
```
[LOGIN] Login error occurred: { name: 'TypeError', message: 'fetch failed', ... }
[LOGIN] Network error detected: fetch failed
```

---

## 🔍 디버깅

### Vercel 로그 확인:

**성공 시:**
- `[LOGIN] Response received: { status: 200, ... }`
- `[LOGIN] Response data received: { hasToken: true, ... }`
- `[LOGIN] Login successful, redirecting to /admin`

**실패 시:**
- `[LOGIN] Login error occurred: { ... }`
- 에러 타입에 따른 적절한 redirect

### Railway 로그 확인:

**성공 시:**
- `[AUTH] Login request received: { ... }`
- `[AUTH] Login successful: { ... }`
- `[AUTH] Response sent successfully`

---

## 📋 체크리스트

### 코드 변경:
- [x] redirect() 호출 방식 변경 완료
- [x] 에러 타입별 처리 추가 완료
- [x] 로깅 개선 완료

### 테스트:
- [ ] 로그인 성공 테스트
- [ ] 인증 실패 테스트
- [ ] 네트워크 오류 테스트
- [ ] Vercel 로그 확인
- [ ] Railway 로그 확인

---

## 🎯 핵심 개선 사항

1. **redirect() 안전 처리**: Next.js의 redirect() 예외를 적절히 처리
2. **명시적 에러 타입**: 에러 타입별로 적절한 redirect 처리
3. **로깅 개선**: 각 단계별 상세 로깅

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
