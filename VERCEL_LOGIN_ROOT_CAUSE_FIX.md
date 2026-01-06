# Vercel 로그인 문제 근본 해결 가이드

## 🔍 문제 분석

**증상:**
- Vercel 로그인 페이지에서 "네트워크 오류" 발생
- `NEXT_PUBLIC_API_URL` 환경 변수는 정상 설정됨
- n8n은 정상적으로 Railway API와 통신 중

**가능한 원인:**
1. **CORS 문제**: Railway CORS 설정이 Vercel 도메인을 허용하지 않음
2. **Railway 로그인 엔드포인트 문제**: 요청이 도달하지 않거나 응답이 없음
3. **네트워크 타임아웃**: Vercel → Railway 요청이 타임아웃
4. **Railway 서버 상태**: 서버가 응답하지 않음

---

## ✅ 근본 해결 방법

### 방법 1: Railway CORS 설정 개선 (가장 중요)

**문제:**
- Railway CORS 설정이 특정 Vercel 도메인만 허용
- Vercel은 배포마다 다른 도메인을 사용할 수 있음
- 예: `ouscaravan-5v1m385df-pos01204s-projects.vercel.app`

**해결:**

`railway-backend/src/app.ts` 파일 수정:

```typescript
// CORS 설정 - Vercel 도메인 허용
const allowedOrigins = [
  'https://ouscaravan.vercel.app',
  'http://localhost:3000',
];

// Vercel 도메인 패턴 허용 (모든 Vercel 서브도메인)
const vercelPattern = /^https:\/\/ouscaravan.*\.vercel\.app$/;
const vercelProjectsPattern = /^https:\/\/ouscaravan-.*\.vercel\.app$/;

// 환경 변수에서 추가 도메인 허용
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
}

app.use(cors({
  origin: (origin, callback) => {
    // origin이 없으면 (같은 도메인 요청 등) 허용
    if (!origin) {
      return callback(null, true);
    }
    
    // 허용된 origin 목록 확인
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Vercel 도메인 패턴 확인
    if (vercelPattern.test(origin) || vercelProjectsPattern.test(origin)) {
      console.log('CORS: Allowing Vercel origin:', origin);
      return callback(null, true);
    }
    
    // 개발 환경에서는 모든 origin 허용
    if (process.env.NODE_ENV !== 'production') {
      console.log('CORS: Allowing origin in development:', origin);
      return callback(null, true);
    }
    
    // 프로덕션에서 허용되지 않은 origin
    console.error('CORS: Blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));
```

---

### 방법 2: Railway 로그인 엔드포인트 로깅 강화

**문제:**
- Railway 로그인 요청이 도달하는지 확인 불가
- 에러 발생 시 원인 파악 어려움

**해결:**

`railway-backend/src/controllers/auth.controller.ts` 파일 수정:

```typescript
export async function login(req: Request, res: Response) {
  try {
    // 요청 로깅
    console.log('[AUTH] Login request received:', {
      timestamp: new Date().toISOString(),
      origin: req.headers.origin || 'no origin',
      userAgent: req.headers['user-agent'] || 'no user-agent',
      body: {
        id: req.body.id ? 'provided' : 'missing',
        password: req.body.password ? 'provided' : 'missing',
      },
    });

    const { id, password } = req.body;

    // 입력 검증
    if (!id || !password) {
      console.log('[AUTH] Missing credentials');
      return res.status(400).json({
        error: 'ID and password are required',
        code: 'MISSING_CREDENTIALS',
      });
    }

    // 인증 확인
    if (id !== ADMIN_CREDENTIALS.id || password !== ADMIN_CREDENTIALS.password) {
      console.log('[AUTH] Invalid credentials:', {
        providedId: id,
        providedPasswordLength: password?.length || 0,
      });
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // JWT 토큰 생성
    const token = generateToken({
      id: ADMIN_CREDENTIALS.id,
      username: ADMIN_CREDENTIALS.id,
    });

    console.log('[AUTH] Login successful:', {
      id: ADMIN_CREDENTIALS.id,
      tokenLength: token.length,
    });

    res.json({
      token,
      expiresIn: 604800, // 7일 (초 단위)
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
```

---

### 방법 3: Vercel 로그인 요청 개선

**현재 상태:**
- `lib/auth.ts`에 이미 상세 로깅이 있음
- 타임아웃 설정도 있음

**추가 개선:**

`lib/auth.ts`에 요청 헤더 추가:

```typescript
const response = await fetch(loginUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'OUSCARAVAN-Admin/1.0',
  },
  body: JSON.stringify({
    id: id.toString(),
    password: password.toString(),
  }),
  signal: controller.signal,
});
```

---

### 방법 4: Railway 환경 변수 확인

**Railway 환경 변수 설정:**

1. Railway 프로젝트 → Settings → Variables
2. 다음 변수 확인:
   - `NODE_ENV`: `production`
   - `PORT`: `8080` (또는 Railway가 할당한 포트)
   - `DATABASE_URL`: PostgreSQL 연결 문자열
   - `JWT_SECRET`: JWT 토큰 생성용 시크릿
   - `ALLOWED_ORIGINS`: (선택) 추가 허용 도메인 (쉼표로 구분)

---

## 🔧 단계별 해결 절차

### 1단계: Railway CORS 설정 수정

1. `railway-backend/src/app.ts` 파일 열기
2. CORS 설정 부분 수정 (위의 방법 1 참고)
3. Railway에 배포

### 2단계: Railway 로그인 로깅 강화

1. `railway-backend/src/controllers/auth.controller.ts` 파일 열기
2. 로깅 추가 (위의 방법 2 참고)
3. Railway에 배포

### 3단계: 테스트

1. Vercel 로그인 페이지에서 로그인 시도
2. Vercel Functions 로그 확인 (`[LOGIN]` 메시지)
3. Railway 로그 확인 (`[AUTH]` 메시지)

### 4단계: 문제 진단

**Vercel 로그에서 확인:**
- `[LOGIN] Starting login process` - 요청 시작
- `[LOGIN] Response received` - Railway 응답 수신
- `[LOGIN] Login error` - 에러 발생

**Railway 로그에서 확인:**
- `[AUTH] Login request received` - 요청 도달
- `[AUTH] Login successful` - 로그인 성공
- `CORS: Allowing Vercel origin` - CORS 허용

---

## 📋 체크리스트

### Railway 설정:
- [ ] CORS 설정에 Vercel 도메인 패턴 추가
- [ ] 로그인 엔드포인트 로깅 추가
- [ ] Railway 환경 변수 확인
- [ ] Railway 배포 완료

### Vercel 설정:
- [ ] `NEXT_PUBLIC_API_URL` 환경 변수 확인
- [ ] Vercel 재배포 완료
- [ ] Vercel Functions 로그 확인

### 테스트:
- [ ] Vercel 로그인 페이지 접속
- [ ] 로그인 시도
- [ ] Vercel 로그 확인
- [ ] Railway 로그 확인

---

## 🚀 빠른 해결 (우선순위)

1. **Railway CORS 설정 수정** (가장 중요)
   - Vercel 도메인 패턴 허용
   - Railway 배포

2. **Railway 로그인 로깅 추가**
   - 요청 도달 확인
   - Railway 배포

3. **테스트 및 로그 확인**
   - Vercel 로그인 시도
   - 양쪽 로그 확인

---

## 🔍 디버깅 명령어

**Vercel 로그 확인:**
```bash
# Vercel 대시보드 → Functions → Logs
# 또는 Vercel CLI 사용
vercel logs
```

**Railway 로그 확인:**
```bash
# Railway 대시보드 → Deployments → Logs
# 또는 Railway CLI 사용
railway logs
```

**수동 테스트 (curl):**
```bash
# Railway 로그인 엔드포인트 테스트
curl -X POST https://ouscaravan-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://ouscaravan.vercel.app" \
  -d '{"id":"ouscaravan","password":"123456789a"}'
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
