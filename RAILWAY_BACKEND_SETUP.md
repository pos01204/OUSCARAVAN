# Railway 백엔드 구현 가이드

## 📋 개요

이 문서는 Railway 백엔드 API 서버 구현을 위한 단계별 가이드를 제공합니다.

**기술 스택**:
- Node.js + Express
- PostgreSQL (Railway 제공)
- JWT (인증)
- TypeScript (선택사항)

---

## 🚀 1단계: Railway 프로젝트 생성

### 1.1 Railway 계정 생성 및 로그인

1. [Railway](https://railway.app) 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭

### 1.2 PostgreSQL 데이터베이스 생성

1. Railway 대시보드에서 "New" → "Database" → "Add PostgreSQL" 선택
2. 데이터베이스가 자동으로 생성됨
3. 데이터베이스 연결 정보 확인:
   - `DATABASE_URL` 환경 변수에 자동 설정됨
   - 또는 데이터베이스 탭에서 직접 확인 가능

### 1.3 새 서비스 생성

1. "New" → "Empty Service" 선택
2. GitHub 레포지토리 연결 (또는 빈 프로젝트 생성)
3. 서비스 이름 설정: `ouscaravan-api`

---

## 📦 2단계: 프로젝트 구조 생성

### 2.1 디렉토리 구조

```
railway-backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── reservations.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── rooms.controller.ts
│   │   └── stats.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/
│   │   ├── Reservation.ts
│   │   ├── Order.ts
│   │   ├── Room.ts
│   │   └── CheckInOutLog.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── admin.routes.ts
│   │   └── guest.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── reservations.service.ts
│   │   ├── orders.service.ts
│   │   └── rooms.service.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   └── errors.ts
│   └── app.ts
├── migrations/
│   └── 001_initial_schema.sql
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### 2.2 package.json 생성

```json
{
  "name": "ouscaravan-api",
  "version": "1.0.0",
  "description": "OUSCARAVAN 예약 관리 시스템 백엔드 API",
  "main": "dist/app.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "migrate": "node -r dotenv/config migrations/run.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.5",
    "@types/pg": "^8.10.9",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/uuid": "^9.0.7",
    "typescript": "^5.3.3",
    "ts-node-dev": "^2.0.0"
  }
}
```

---

## 🗄️ 3단계: 데이터베이스 스키마 생성

### 3.1 마이그레이션 스크립트 작성

`migrations/001_initial_schema.sql` 파일을 생성하고 `RAILWAY_API_SPEC.md`의 스키마 정의를 사용합니다.

### 3.2 데이터베이스 연결 설정

`src/config/database.ts` 파일 생성:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;
```

---

## 🔐 4단계: 인증 시스템 구현

### 4.1 JWT 토큰 생성 및 검증

`src/utils/jwt.ts` 파일 생성:

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(payload: { id: string; username: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { id: string; username: string } {
  return jwt.verify(token, JWT_SECRET) as { id: string; username: string };
}
```

### 4.2 인증 미들웨어

`src/middleware/auth.middleware.ts` 파일 생성:

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## 📡 5단계: API 엔드포인트 구현

### 5.1 관리자 인증 API

`src/routes/auth.routes.ts`:

```typescript
import express from 'express';
import { login } from '../controllers/auth.controller';

const router = express.Router();

router.post('/login', login);

export default router;
```

### 5.2 관리자 API 라우트

`src/routes/admin.routes.ts`:

```typescript
import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getReservations,
  getReservation,
  updateReservation,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getOrders,
  updateOrderStatus,
  getStats,
} from '../controllers';

const router = express.Router();

router.use(authenticate); // 모든 관리자 라우트에 인증 적용

router.get('/reservations', getReservations);
router.get('/reservations/:id', getReservation);
router.patch('/reservations/:id', updateReservation);
router.get('/rooms', getRooms);
router.post('/rooms', createRoom);
router.patch('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);
router.get('/orders', getOrders);
router.patch('/orders/:id', updateOrderStatus);
router.get('/stats', getStats);

export default router;
```

### 5.3 고객 API 라우트

`src/routes/guest.routes.ts`:

```typescript
import express from 'express';
import {
  getGuestInfo,
  getOrders,
  createOrder,
  checkIn,
  checkOut,
} from '../controllers/guest.controller';

const router = express.Router();

router.get('/:token', getGuestInfo);
router.get('/:token/orders', getOrders);
router.post('/:token/orders', createOrder);
router.post('/:token/checkin', checkIn);
router.post('/:token/checkout', checkOut);

export default router;
```

---

## 🚀 6단계: Railway 배포 설정

### 6.1 환경 변수 설정

Railway 대시보드에서 다음 환경 변수 설정:

- `DATABASE_URL`: PostgreSQL 연결 문자열 (자동 설정)
- `JWT_SECRET`: JWT 토큰 비밀키
- `PORT`: 서버 포트 (기본값: 3000)
- `NODE_ENV`: `production`

### 6.2 빌드 설정

Railway는 자동으로 `package.json`의 `build` 스크립트를 실행합니다.

### 6.3 시작 명령어

Railway에서 시작 명령어 설정:
```
npm start
```

---

## 📝 다음 단계

1. **컨트롤러 구현**: 각 API 엔드포인트의 비즈니스 로직 구현
2. **서비스 레이어**: 데이터베이스 쿼리 로직 분리
3. **에러 처리**: 통일된 에러 응답 형식
4. **입력 검증**: 요청 데이터 검증 미들웨어
5. **테스트**: API 엔드포인트 테스트

---

## 📚 참고 문서

- [RAILWAY_API_SPEC.md](./RAILWAY_API_SPEC.md) - API 스펙 상세 정의
- [Railway 공식 문서](https://docs.railway.app)
- [Express 공식 문서](https://expressjs.com)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
