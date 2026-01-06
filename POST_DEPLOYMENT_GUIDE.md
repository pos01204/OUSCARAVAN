# 배포 후 작업 가이드

## 📋 개요

Railway 백엔드 API 배포가 완료된 후 필요한 작업들을 안내합니다.

---

## ✅ 1단계: 배포 확인 및 기본 테스트

### 1.1 Health Check

Railway API 서버가 정상적으로 실행 중인지 확인:

```bash
curl https://your-railway-app.railway.app/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### 1.2 관리자 로그인 테스트

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

**토큰 저장**: 응답받은 토큰을 변수에 저장 (다음 테스트에서 사용)
```bash
export ADMIN_TOKEN="your-token-here"
```

### 1.3 관리자 API 테스트

#### 통계 조회
```bash
curl https://your-railway-app.railway.app/api/admin/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 예약 목록 조회
```bash
curl https://your-railway-app.railway.app/api/admin/reservations \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 방 목록 조회
```bash
curl https://your-railway-app.railway.app/api/admin/rooms \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 주문 목록 조회
```bash
curl https://your-railway-app.railway.app/api/admin/orders \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🔗 2단계: 프론트엔드 연동

### 2.1 Vercel 환경 변수 업데이트

Vercel 대시보드 → Project Settings → Environment Variables:

1. **기존 환경 변수 확인**
   - `NEXT_PUBLIC_API_URL` 확인

2. **Railway API URL로 업데이트**
   - 값: `https://your-railway-app.railway.app`
   - 예: `https://ouscaravan-api.railway.app`

3. **환경 변수 적용**
   - Production, Preview, Development 모두 업데이트
   - 저장 후 자동 재배포 확인

### 2.2 프론트엔드 재배포 확인

- [ ] Vercel에서 자동 재배포 완료 확인
- [ ] 배포 로그에서 에러 없음 확인
- [ ] 배포 URL 접속 확인

---

## 🧪 3단계: 통합 테스트

### 3.1 관리자 페이지 테스트

1. **로그인 테스트**
   - URL: `https://ouscaravan.vercel.app/login`
   - ID: `ouscaravan`, PW: `123456789a`
   - 로그인 성공 확인

2. **대시보드 테스트**
   - 통계 데이터 표시 확인
   - 최근 예약 목록 표시 확인

3. **예약 관리 테스트**
   - 예약 목록 조회
   - 예약 상세 조회
   - 방 배정 및 전화번호 입력
   - 예약 정보 업데이트

4. **방 관리 테스트**
   - 방 목록 조회
   - 방 추가
   - 방 수정
   - 방 삭제

5. **주문 관리 테스트**
   - 주문 목록 조회
   - 주문 상세 조회
   - 주문 상태 업데이트

### 3.2 고객 페이지 테스트

1. **예약 생성 및 토큰 발급**
   - 관리자 페이지에서 예약 생성
   - 방 배정 및 전화번호 입력
   - 고유 토큰 생성 확인

2. **고객 페이지 접근**
   - URL: `https://ouscaravan.vercel.app/guest/[token]`
   - 예약 정보 표시 확인

3. **고객 기능 테스트**
   - 주문 생성
   - 주문 목록 조회
   - 체크인 처리
   - 체크아웃 처리

---

## 🤖 4단계: n8n 워크플로우 연동

### 4.1 n8n Webhook URL 확인

n8n 대시보드에서 Webhook URL 확인:

1. **예약 배정 알림톡 발송 워크플로우**
   - Webhook Trigger 노드의 URL 확인
   - 예: `https://your-n8n-instance.com/webhook/reservation-assigned`

2. **체크인 알림 워크플로우** (선택사항)
   - Webhook URL 확인

3. **체크아웃 알림 워크플로우** (선택사항)
   - Webhook URL 확인

4. **주문 알림 워크플로우** (선택사항)
   - Webhook URL 확인

### 4.2 Vercel 환경 변수 설정

Vercel 대시보드 → Project Settings → Environment Variables:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/reservation-assigned
```

### 4.3 n8n 워크플로우 테스트

1. **예약 배정 테스트**
   - 관리자 페이지에서 예약 상세 페이지로 이동
   - 방 배정 및 전화번호 입력 후 저장
   - n8n 워크플로우 실행 확인
   - 알림톡 발송 확인

2. **체크인/체크아웃 테스트** (선택사항)
   - 고객 페이지에서 체크인/체크아웃 처리
   - n8n 워크플로우 실행 확인

3. **주문 알림 테스트** (선택사항)
   - 고객 페이지에서 주문 생성
   - n8n 워크플로우 실행 확인

---

## 📊 5단계: 모니터링 설정

### 5.1 Railway 모니터링

- [ ] Railway 대시보드에서 서비스 로그 확인
- [ ] 메트릭 확인 (CPU, 메모리, 네트워크)
- [ ] 에러 로그 확인

### 5.2 데이터베이스 모니터링

- [ ] PostgreSQL 연결 상태 확인
- [ ] 쿼리 성능 확인
- [ ] 데이터베이스 크기 확인

### 5.3 Vercel 모니터링

- [ ] Vercel 대시보드에서 배포 상태 확인
- [ ] 함수 실행 로그 확인
- [ ] 에러 로그 확인

---

## 🔧 6단계: 문제 해결

### 문제 1: API 연결 실패

**증상**: 프론트엔드에서 API 호출 실패

**확인 사항**:
1. `NEXT_PUBLIC_API_URL` 환경 변수 확인
2. Railway API 서버 상태 확인
3. CORS 설정 확인 (Railway에서 CORS 허용 확인)

**해결 방법**:
- Railway API 서버의 CORS 설정 확인
- `src/app.ts`에서 CORS 설정 확인

### 문제 2: 인증 실패

**증상**: 관리자 로그인 실패 또는 401 에러

**확인 사항**:
1. `JWT_SECRET` 환경 변수 확인
2. 프론트엔드와 백엔드의 `JWT_SECRET` 일치 확인
3. 토큰 만료 시간 확인

**해결 방법**:
- Railway와 Vercel의 `JWT_SECRET` 동일하게 설정
- 환경 변수 재설정 후 재배포

### 문제 3: 데이터베이스 연결 실패

**증상**: API 호출 시 데이터베이스 에러

**확인 사항**:
1. `DATABASE_URL` 환경 변수 확인
2. PostgreSQL 서비스 상태 확인
3. 데이터베이스 마이그레이션 실행 확인

**해결 방법**:
- Railway 대시보드에서 PostgreSQL 서비스 상태 확인
- 데이터베이스 마이그레이션 재실행

### 문제 4: n8n 웹훅 호출 실패

**증상**: 알림톡 발송 안 됨

**확인 사항**:
1. `NEXT_PUBLIC_N8N_WEBHOOK_URL` 환경 변수 확인
2. n8n 워크플로우 활성화 확인
3. n8n 웹훅 URL 정확성 확인

**해결 방법**:
- n8n 워크플로우에서 Webhook URL 확인
- Vercel 환경 변수 업데이트
- 재배포 후 테스트

---

## ✅ 체크리스트

배포 후 확인사항:

### Railway 백엔드
- [ ] Health check 성공
- [ ] 관리자 로그인 성공
- [ ] 모든 관리자 API 엔드포인트 정상 작동
- [ ] 모든 고객 API 엔드포인트 정상 작동
- [ ] 데이터베이스 쿼리 정상 작동
- [ ] 로그에 에러 없음

### Vercel 프론트엔드
- [ ] `NEXT_PUBLIC_API_URL` 환경 변수 설정 완료
- [ ] 재배포 완료
- [ ] 관리자 로그인 페이지 정상 작동
- [ ] 관리자 대시보드 데이터 표시 확인
- [ ] 예약 관리 기능 정상 작동
- [ ] 방 관리 기능 정상 작동
- [ ] 주문 관리 기능 정상 작동
- [ ] 고객 페이지 접근 및 기능 정상 작동

### n8n 연동
- [ ] `NEXT_PUBLIC_N8N_WEBHOOK_URL` 환경 변수 설정 완료
- [ ] 예약 배정 시 n8n 웹훅 호출 확인
- [ ] 알림톡 발송 확인

---

## 📚 참고 문서

- [RAILWAY_DEPLOYMENT_CHECKLIST.md](./RAILWAY_DEPLOYMENT_CHECKLIST.md) - 배포 체크리스트
- [RAILWAY_ENV_SETUP.md](./RAILWAY_ENV_SETUP.md) - 환경 변수 설정 가이드
- [RAILWAY_API_SPEC.md](./RAILWAY_API_SPEC.md) - API 스펙 상세 정의
- [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md) - 문제 해결 가이드

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
