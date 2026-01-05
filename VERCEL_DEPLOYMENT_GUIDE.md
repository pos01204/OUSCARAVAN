# Vercel 배포 가이드

## 📋 배포 구조 개요

### 단일 프로젝트 배포 (권장)

**하나의 Vercel 프로젝트에서 관리자 페이지와 고객 페이지 모두 배포합니다.**

**장점:**
- ✅ 하나의 GitHub 레포지토리로 관리
- ✅ 하나의 Vercel 프로젝트로 관리
- ✅ 환경 변수 통합 관리
- ✅ 배포 간소화

**URL 구조:**
- 관리자 페이지: `https://ouscaravan.vercel.app/admin/*`
- 고객 페이지: `https://ouscaravan.vercel.app/guest/[token]`
- 루트 페이지: `https://ouscaravan.vercel.app` (리다이렉트 또는 랜딩 페이지)

---

## 🚀 Vercel 배포 설정

### 1단계: GitHub 레포지토리 준비

#### 레포지토리 구조

```
ouscaravan/
├── app/
│   ├── admin/          # 관리자 페이지
│   ├── guest/          # 고객 페이지
│   └── layout.tsx
├── components/
├── lib/
├── middleware.ts       # 인증 미들웨어
├── package.json
├── next.config.js
└── tsconfig.json
```

#### GitHub에 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/ouscaravan.git
git push -u origin main
```

### 2단계: Vercel 프로젝트 생성

#### 방법 1: Vercel 대시보드에서 생성

1. [Vercel](https://vercel.com/) 접속 및 로그인
2. **"Add New Project"** 클릭
3. GitHub 레포지토리 선택: `ouscaravan`
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 감지)
   - **Output Directory**: `.next` (자동 감지)
   - **Install Command**: `npm install` (자동 감지)
5. **Environment Variables** 설정 (아래 참고)
6. **Deploy** 클릭

#### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서
vercel

# 프로덕션 배포
vercel --prod
```

### 3단계: 환경 변수 설정

**Vercel 대시보드 → Project Settings → Environment Variables:**

```env
# Railway 백엔드 API URL
NEXT_PUBLIC_API_URL=https://ouscaravan-api.railway.app

# 관리자 인증 (NextAuth.js)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://ouscaravan.vercel.app

# 웹 앱 URL
NEXT_PUBLIC_WEB_APP_URL=https://ouscaravan.vercel.app

# Railway API 키 (관리자 API 호출용)
RAILWAY_API_KEY=your-railway-api-key
```

**환경 변수 적용 범위:**
- **Production**: 프로덕션 환경
- **Preview**: 프리뷰 환경 (PR 등)
- **Development**: 로컬 개발 환경

### 4단계: 빌드 설정 확인

**Vercel은 Next.js를 자동으로 감지하지만, 명시적으로 설정할 수 있습니다:**

**`vercel.json` (선택사항):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/admin/:path*",
      "destination": "/admin/:path*"
    },
    {
      "source": "/guest/:path*",
      "destination": "/guest/:path*"
    }
  ]
}
```

---

## 🔐 인증 설정

### 관리자 페이지 인증

**`middleware.ts` (프로젝트 루트):**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 관리자 페이지 접근 제어
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token')?.value;
    
    // 로그인 페이지는 제외
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/guest/:path*'
  ]
};
```

### 관리자 로그인 페이지

**`app/(auth)/login/page.tsx`:**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Railway 백엔드 API로 인증
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const { token } = await response.json();
      document.cookie = `admin-token=${token}; path=/; max-age=86400`; // 24시간
      router.push('/admin');
    } else {
      alert('로그인 실패');
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="사용자명"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">로그인</button>
    </form>
  );
}
```

---

## 📁 라우팅 구조

### 관리자 페이지 라우팅

```
/admin                    → 관리자 대시보드
/admin/reservations       → 예약 목록
/admin/reservations/[id]  → 예약 상세
/admin/rooms              → 방 관리
/admin/orders             → 주문 관리
```

### 고객 페이지 라우팅

```
/guest/[token]              → 고객 홈
/guest/[token]/guide        → 안내
/guest/[token]/order        → 주문
/guest/[token]/checkinout   → 체크인/체크아웃
/guest/[token]/help         → 도움말
```

### 레이아웃 구조

**`app/layout.tsx` (루트 레이아웃):**
```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OUSCARAVAN",
  description: "오우스카라반 예약 관리 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

**`app/admin/layout.tsx` (관리자 레이아웃):**
```typescript
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  
  // 인증 체크 (미들웨어에서도 처리하지만 이중 체크)
  if (!token) {
    redirect('/admin/login');
  }
  
  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <a href="/admin">대시보드</a>
        <a href="/admin/reservations">예약 관리</a>
        <a href="/admin/rooms">방 관리</a>
        <a href="/admin/orders">주문 관리</a>
      </nav>
      <main>{children}</main>
    </div>
  );
}
```

---

## 🔄 Railway 백엔드 API 연동

### API 호출 함수

**`lib/api.ts`:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ouscaravan-api.railway.app';

// 관리자 API 호출
export async function adminApi(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('admin-token='))
    ?.split('=')[1];
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// 고객 API 호출 (토큰 기반)
export async function guestApi(token: string, endpoint: string) {
  const response = await fetch(`${API_URL}/api/guest/${token}${endpoint}`);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}
```

### 사용 예시

**관리자 페이지에서 예약 목록 조회:**
```typescript
import { adminApi } from '@/lib/api';

const reservations = await adminApi('/api/admin/reservations');
```

**고객 페이지에서 예약 정보 조회:**
```typescript
import { guestApi } from '@/lib/api';

const reservation = await guestApi(token, '');
```

---

## 🚀 배포 프로세스

### 자동 배포 (GitHub 연동)

1. **GitHub에 코드 푸시**
   ```bash
   git add .
   git commit -m "Update admin page"
   git push origin main
   ```

2. **Vercel 자동 배포**
   - GitHub에 푸시하면 Vercel이 자동으로 감지
   - 빌드 및 배포 자동 실행
   - 배포 완료 후 알림

### 수동 배포 (Vercel CLI)

```bash
# 프로덕션 배포
vercel --prod

# 프리뷰 배포
vercel
```

### 배포 확인

1. **Vercel 대시보드**에서 배포 상태 확인
2. **배포 URL**로 접속하여 테스트
3. **로그 확인** (에러 발생 시)

---

## 🔍 배포 관리

### 환경별 배포

**Production (프로덕션):**
- `main` 브랜치에 푸시 시 자동 배포
- 도메인: `https://ouscaravan.vercel.app`

**Preview (프리뷰):**
- PR 생성 시 자동 배포
- 도메인: `https://ouscaravan-git-{branch}-{username}.vercel.app`

**Development (로컬):**
- `npm run dev`로 로컬 개발 서버 실행
- 도메인: `http://localhost:3000`

### 배포 롤백

1. **Vercel 대시보드** → **Deployments**
2. 이전 배포 버전 선택
3. **"Promote to Production"** 클릭

### 환경 변수 관리

**프로덕션 환경 변수:**
- Vercel 대시보드에서 설정
- 민감한 정보는 절대 코드에 포함하지 않음

**로컬 개발 환경 변수:**
- `.env.local` 파일 사용
- `.gitignore`에 추가하여 Git에 커밋하지 않음

---

## 📊 모니터링

### Vercel Analytics

1. **Vercel 대시보드** → **Analytics**
2. 페이지뷰, 성능 메트릭 확인
3. 에러 로그 확인

### 에러 로깅

**`lib/logger.ts`:**
```typescript
export function logError(error: Error, context?: Record<string, any>) {
  // Vercel Logs 또는 외부 로깅 서비스로 전송
  console.error('Error:', error, context);
  
  // 필요시 Sentry 등 에러 트래킹 서비스 연동
}
```

---

## 🆘 문제 해결

### 빌드 실패

**원인:**
- TypeScript 오류
- 의존성 문제
- 환경 변수 누락

**해결:**
1. 로컬에서 `npm run build` 실행하여 오류 확인
2. Vercel 빌드 로그 확인
3. 환경 변수 설정 확인

### 배포 후 페이지가 보이지 않음

**원인:**
- 라우팅 설정 오류
- 미들웨어 문제
- 인증 문제

**해결:**
1. Vercel 배포 로그 확인
2. 브라우저 콘솔 확인
3. 네트워크 탭에서 API 호출 확인

### API 호출 실패

**원인:**
- CORS 설정 문제
- Railway 백엔드 연결 문제
- 인증 토큰 문제

**해결:**
1. Railway 백엔드 로그 확인
2. CORS 설정 확인
3. API URL 환경 변수 확인

---

## 📋 체크리스트

### 배포 전 확인사항
- [ ] GitHub 레포지토리 준비 완료
- [ ] 환경 변수 설정 완료
- [ ] 로컬 빌드 성공 확인
- [ ] Railway 백엔드 API 연결 확인
- [ ] 인증 시스템 테스트 완료

### 배포 후 확인사항
- [ ] 관리자 페이지 접근 확인
- [ ] 고객 페이지 접근 확인
- [ ] API 호출 정상 작동 확인
- [ ] 인증 시스템 정상 작동 확인
- [ ] 모바일 반응형 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
