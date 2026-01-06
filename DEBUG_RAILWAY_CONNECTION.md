# Railway 연결 디버깅 가이드

## 🔍 문제 진단

브라우저 테스트 결과:
- 로그인 시도 시 `network_error` 발생
- 서버 액션이 실행되지만 Railway API 호출 실패
- 네트워크 요청에서 Railway API 호출이 보이지 않음 (서버 사이드에서 실행됨)

## 📋 확인 사항

### 1. Vercel 환경 변수 확인

Vercel 대시보드 → Project Settings → Environment Variables:

**필수 확인**:
- `NEXT_PUBLIC_API_URL` - Railway API URL이 올바르게 설정되어 있는지 확인
- 예: `https://your-railway-app.railway.app`

**주의사항**:
- `NEXT_PUBLIC_` 접두사가 있어야 클라이언트에서 접근 가능
- 하지만 서버 액션은 서버 사이드에서 실행되므로 `process.env.NEXT_PUBLIC_API_URL`이 제대로 읽히는지 확인 필요

### 2. Railway 서버 상태 확인

Railway 대시보드에서:
1. 서비스가 "Running" 상태인지 확인
2. 로그에서 에러 메시지 확인
3. Health check 엔드포인트 테스트:

```bash
curl https://your-railway-app.railway.app/health
```

### 3. 서버 사이드 로그 확인

Vercel 대시보드 → Functions → Logs:
- 로그인 시도 시 에러 메시지 확인
- `Login error:` 로그 확인
- `API URL:` 로그 확인

## 🔧 해결 방법

### 방법 1: 환경 변수 확인 및 재배포

1. Vercel 대시보드에서 `NEXT_PUBLIC_API_URL` 확인
2. Railway 대시보드에서 실제 서비스 URL 확인
3. 두 URL이 일치하는지 확인
4. Vercel에서 재배포

### 방법 2: Railway 서버 재배포

1. Railway 대시보드에서 서비스 선택
2. "Deploy" 또는 "Redeploy" 클릭
3. 배포 완료 대기
4. Health check 테스트

### 방법 3: 직접 API 테스트

터미널에서 Railway API 직접 테스트:

```bash
curl -X POST https://your-railway-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ouscaravan",
    "password": "123456789a"
  }'
```

**예상 응답**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800
}
```

**에러 응답인 경우**:
- 401: 인증 실패 (아이디/비밀번호 확인)
- 500: 서버 오류 (Railway 로그 확인)
- 연결 실패: Railway 서버가 실행되지 않음

## 🐛 일반적인 문제

### 문제 1: 환경 변수가 설정되지 않음

**증상**: `API URL: undefined` 또는 기본값 사용

**해결**:
1. Vercel 대시보드에서 환경 변수 확인
2. `NEXT_PUBLIC_API_URL` 설정
3. 재배포

### 문제 2: Railway 서버가 실행되지 않음

**증상**: 연결 타임아웃 또는 연결 거부

**해결**:
1. Railway 대시보드에서 서비스 상태 확인
2. 로그에서 에러 확인
3. 환경 변수 확인 (DATABASE_URL, JWT_SECRET)
4. 재배포

### 문제 3: CORS 에러

**증상**: 브라우저 콘솔에 CORS 에러

**해결**:
1. Railway 백엔드의 CORS 설정 확인
2. Vercel 도메인이 허용 목록에 있는지 확인
3. Railway 서버 재배포

## 📝 체크리스트

- [ ] Vercel `NEXT_PUBLIC_API_URL` 환경 변수 설정됨
- [ ] Railway 서비스가 "Running" 상태
- [ ] Railway Health check 엔드포인트 응답 확인
- [ ] Railway 로그인 API 직접 테스트 성공
- [ ] Vercel Functions 로그에서 에러 메시지 확인
- [ ] Railway 환경 변수 설정 확인 (DATABASE_URL, JWT_SECRET)
- [ ] 데이터베이스 마이그레이션 완료

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
