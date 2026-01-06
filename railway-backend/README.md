# OUSCARAVAN 백엔드 API

OUSCARAVAN 예약 관리 시스템의 Railway 백엔드 API 서버입니다.

## 📋 기술 스택

- **Node.js** + **Express**
- **PostgreSQL** (Railway 제공)
- **TypeScript**
- **JWT** (인증)

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=development
```

### 3. 데이터베이스 마이그레이션

```bash
npm run migrate
```

또는 Railway PostgreSQL 데이터베이스에 직접 연결하여 `migrations/001_initial_schema.sql` 파일을 실행하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## 📡 API 엔드포인트

자세한 API 스펙은 [RAILWAY_API_SPEC.md](../RAILWAY_API_SPEC.md)를 참조하세요.

### 관리자 API

- `POST /api/auth/login` - 관리자 로그인
- `GET /api/admin/reservations` - 예약 목록 조회
- `GET /api/admin/reservations/:id` - 예약 상세 조회
- `PATCH /api/admin/reservations/:id` - 예약 정보 업데이트
- `GET /api/admin/rooms` - 방 목록 조회
- `POST /api/admin/rooms` - 방 추가
- `PATCH /api/admin/rooms/:id` - 방 정보 업데이트
- `DELETE /api/admin/rooms/:id` - 방 삭제
- `GET /api/admin/orders` - 주문 목록 조회
- `PATCH /api/admin/orders/:id` - 주문 상태 업데이트
- `GET /api/admin/stats` - 통계 조회

### 고객 API

- `GET /api/guest/:token` - 고객 정보 조회
- `GET /api/guest/:token/orders` - 주문 목록 조회
- `POST /api/guest/:token/orders` - 주문 생성
- `POST /api/guest/:token/checkin` - 체크인
- `POST /api/guest/:token/checkout` - 체크아웃

## 🗄️ 데이터베이스 스키마

- `reservations` - 예약 정보
- `orders` - 주문 정보
- `check_in_out_logs` - 체크인/체크아웃 로그
- `rooms` - 방 정보

## 🔐 인증

관리자 API는 Bearer Token 인증을 사용합니다:

```
Authorization: Bearer <admin-token>
```

## 🔒 입력 검증

모든 API 엔드포인트에 입력 검증이 적용되어 있습니다:

- 이메일, 전화번호, 날짜 형식 검증
- 문자열 길이, 숫자 범위 검증
- 예약/주문/방 상태 검증
- 주문 아이템 검증

자세한 내용은 `src/utils/validation.ts` 및 `src/middleware/validation.middleware.ts`를 참조하세요.

## 📚 참고 문서

- [RAILWAY_API_SPEC.md](../RAILWAY_API_SPEC.md) - API 스펙 상세 정의
- [RAILWAY_BACKEND_SETUP.md](../RAILWAY_BACKEND_SETUP.md) - Railway 배포 가이드
- [RAILWAY_ENV_SETUP.md](../RAILWAY_ENV_SETUP.md) - 환경 변수 설정 가이드
- [RAILWAY_DEPLOYMENT_CHECKLIST.md](../RAILWAY_DEPLOYMENT_CHECKLIST.md) - 배포 체크리스트

---

**문서 버전**: 1.1  
**최종 업데이트**: 2024-01-15
