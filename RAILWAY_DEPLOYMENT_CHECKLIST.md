# Railway 배포 체크리스트

## 📋 개요

이 문서는 Railway 백엔드 API 서버 배포를 위한 단계별 체크리스트를 제공합니다.

---

## ✅ 배포 전 준비사항

### 1. Railway 계정 및 프로젝트 설정

- [ ] Railway 계정 생성 및 로그인
- [ ] 새 프로젝트 생성 또는 기존 프로젝트 선택
- [ ] 프로젝트 이름 확인: `ouscaravan-api` (또는 원하는 이름)

### 2. PostgreSQL 데이터베이스 생성

- [ ] Railway 대시보드에서 "New" → "Database" → "Add PostgreSQL" 선택
- [ ] 데이터베이스 생성 완료 확인
- [ ] `DATABASE_URL` 환경 변수 자동 설정 확인

### 3. API 서비스 생성

- [ ] "New" → "Empty Service" 선택
- [ ] GitHub 레포지토리 연결 (또는 빈 서비스 생성)
- [ ] 서비스 이름 설정

---

## 🔧 환경 변수 설정

### 필수 환경 변수

- [ ] `DATABASE_URL` - PostgreSQL 연결 문자열 (자동 설정됨)
- [ ] `JWT_SECRET` - JWT 토큰 비밀키 (최소 32자)
- [ ] `NODE_ENV` - `production`으로 설정

### 선택적 환경 변수

- [ ] `PORT` - 서버 포트 (Railway가 자동 할당하므로 선택사항)

**설정 방법**: Railway 대시보드 → 서비스 → Variables 탭

**자세한 내용**: `RAILWAY_ENV_SETUP.md` 참조

---

## 📦 코드 배포

### 방법 1: GitHub 연동 (권장)

- [ ] Railway 프로젝트에 GitHub 레포지토리 연결
- [ ] `railway-backend/` 디렉토리를 루트로 설정
- [ ] 자동 배포 활성화 확인

### 방법 2: Railway CLI 사용

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 배포
railway up
```

---

## 🗄️ 데이터베이스 마이그레이션

### 방법 1: Railway 대시보드에서 실행

1. Railway 대시보드 → PostgreSQL 서비스 선택
2. "Query" 또는 "Connect" 탭 선택
3. `railway-backend/migrations/001_initial_schema.sql` 파일 내용 복사
4. SQL 쿼리 실행

### 방법 2: 로컬에서 실행

```bash
# DATABASE_URL 환경 변수 설정
export DATABASE_URL="postgresql://user:password@host:port/database"

# psql로 연결하여 스크립트 실행
psql $DATABASE_URL -f railway-backend/migrations/001_initial_schema.sql
```

### 방법 3: Railway CLI 사용

```bash
# Railway CLI로 데이터베이스 연결
railway connect

# SQL 파일 실행
psql < railway-backend/migrations/001_initial_schema.sql
```

---

## 🚀 빌드 및 시작 명령어 설정

Railway 대시보드 → 서비스 → Settings → Build & Deploy:

- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Start Command**: `npm start`
- [ ] **Root Directory**: `railway-backend` (또는 프로젝트 구조에 맞게)

---

## 🧪 배포 후 테스트

### 1. Health Check

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

### 2. 관리자 로그인 테스트

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

### 3. API 엔드포인트 테스트

관리자 토큰을 사용하여 각 API 엔드포인트 테스트:

- [ ] `GET /api/admin/stats` - 통계 조회
- [ ] `GET /api/admin/reservations` - 예약 목록 조회
- [ ] `GET /api/admin/rooms` - 방 목록 조회
- [ ] `GET /api/admin/orders` - 주문 목록 조회

**테스트 예시**:
```bash
# 통계 조회
curl https://your-railway-app.railway.app/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔗 프론트엔드 연동

### 1. Vercel 환경 변수 업데이트

Vercel 대시보드 → Project Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_API_URL` - Railway API URL로 업데이트
  - 예: `https://ouscaravan-api.railway.app`

### 2. 프론트엔드 재배포

- [ ] Vercel에서 자동 재배포 확인
- [ ] 또는 수동으로 재배포 트리거

### 3. 통합 테스트

- [ ] 관리자 로그인 테스트
- [ ] 예약 목록 조회 테스트
- [ ] 방 관리 테스트
- [ ] 주문 관리 테스트
- [ ] 고객 페이지 접근 테스트 (토큰 필요)

---

## 📊 모니터링

### Railway 대시보드

- [ ] 서비스 로그 확인
- [ ] 메트릭 확인 (CPU, 메모리, 네트워크)
- [ ] 에러 로그 확인

### 데이터베이스 모니터링

- [ ] PostgreSQL 연결 상태 확인
- [ ] 쿼리 성능 확인
- [ ] 데이터베이스 크기 확인

---

## 🐛 문제 해결

### 문제 1: 빌드 실패

**증상**: 배포 시 빌드 오류

**해결 방법**:
1. 로컬에서 `npm run build` 실행하여 오류 확인
2. `package.json`의 빌드 스크립트 확인
3. TypeScript 오류 확인
4. 의존성 설치 오류 확인

### 문제 2: 데이터베이스 연결 실패

**증상**: `Error: connect ECONNREFUSED`

**해결 방법**:
1. `DATABASE_URL` 환경 변수 확인
2. PostgreSQL 서비스가 실행 중인지 확인
3. Railway 대시보드에서 데이터베이스 상태 확인

### 문제 3: API 응답 없음

**증상**: API 호출 시 타임아웃 또는 연결 실패

**해결 방법**:
1. Railway 서비스가 실행 중인지 확인
2. 포트 설정 확인
3. 로그에서 에러 메시지 확인
4. Health check 엔드포인트 테스트

### 문제 4: 인증 실패

**증상**: `401 Unauthorized` 에러

**해결 방법**:
1. `JWT_SECRET` 환경 변수 확인
2. 프론트엔드와 백엔드의 `JWT_SECRET` 일치 확인
3. 토큰 만료 시간 확인

---

## 📚 참고 문서

- [RAILWAY_BACKEND_SETUP.md](./RAILWAY_BACKEND_SETUP.md) - Railway 백엔드 구현 가이드
- [RAILWAY_ENV_SETUP.md](./RAILWAY_ENV_SETUP.md) - 환경 변수 설정 가이드
- [RAILWAY_API_SPEC.md](./RAILWAY_API_SPEC.md) - API 스펙 상세 정의

---

## ✅ 배포 완료 체크리스트

배포가 성공적으로 완료되었는지 확인:

- [ ] Health check 엔드포인트 응답 확인
- [ ] 관리자 로그인 테스트 성공
- [ ] 모든 관리자 API 엔드포인트 테스트 성공
- [ ] 고객 API 엔드포인트 테스트 성공 (토큰 필요)
- [ ] 프론트엔드와 백엔드 연동 확인
- [ ] 데이터베이스 쿼리 정상 작동 확인
- [ ] 로그에 에러 없음 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
