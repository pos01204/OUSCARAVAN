# 프로젝트 구조 상세 가이드

## 📋 개요

**하나의 GitHub 레포지토리와 하나의 Vercel 프로젝트로 관리자 페이지와 고객 페이지를 모두 관리합니다.**

---

## 🗂️ 레포지토리 구조

### 단일 레포지토리 구조 (권장)

```
ouscaravan/                          # GitHub 레포지토리
├── .gitignore
├── .env.local                       # 로컬 환경 변수 (Git에 커밋 안 함)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── middleware.ts                    # Next.js 미들웨어 (인증 체크)
│
├── app/                             # Next.js App Router
│   ├── layout.tsx                   # 루트 레이아웃
│   ├── page.tsx                     # 루트 페이지 (리다이렉트)
│   ├── globals.css                  # 전역 스타일
│   │
│   ├── (auth)/                      # 인증 그룹 (라우팅 그룹)
│   │   └── login/
│   │       └── page.tsx             # 관리자 로그인 페이지
│   │
│   ├── admin/                       # 관리자 페이지 (인증 필요)
│   │   ├── layout.tsx               # 관리자 레이아웃 (인증 체크)
│   │   ├── page.tsx                 # 관리자 대시보드
│   │   ├── reservations/
│   │   │   ├── page.tsx             # 예약 목록
│   │   │   └── [id]/
│   │   │       └── page.tsx         # 예약 상세
│   │   ├── rooms/
│   │   │   └── page.tsx             # 방 관리
│   │   └── orders/
│   │       └── page.tsx             # 주문 관리
│   │
│   └── guest/                       # 고객 페이지 (공개)
│       └── [token]/
│           ├── layout.tsx           # 고객 레이아웃
│           ├── page.tsx             # 고객 홈
│           ├── guide/
│           │   └── page.tsx         # 안내
│           ├── order/
│           │   └── page.tsx         # 주문
│           ├── checkinout/
│           │   └── page.tsx         # 체크인/체크아웃
│           └── help/
│               └── page.tsx         # 도움말
│
├── components/
│   ├── ui/                          # Shadcn UI 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── admin/                       # 관리자 전용 컴포넌트
│   │   ├── ReservationList.tsx
│   │   ├── ReservationDetail.tsx
│   │   ├── RoomAssignment.tsx
│   │   └── OrderManagement.tsx
│   │
│   ├── guest/                       # 고객 전용 컴포넌트
│   │   ├── ReservationCard.tsx
│   │   ├── OrderForm.tsx
│   │   ├── CheckInOut.tsx
│   │   └── GuideContent.tsx
│   │
│   └── shared/                      # 공통 컴포넌트
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Loading.tsx
│
├── lib/
│   ├── api.ts                       # Railway API 호출 함수
│   ├── auth.ts                      # 인증 유틸리티
│   ├── utils.ts                     # 유틸리티 함수
│   └── constants.ts                 # 상수 정의
│
├── types/
│   └── index.ts                     # TypeScript 타입 정의
│
└── public/                          # 정적 파일
    ├── images/
    └── icons/
```

---

## 🔐 인증 구조

### 미들웨어 설정

**`middleware.ts` (프로젝트 루트):**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 관리자 페이지 접근 제어
  if (pathname.startsWith('/admin')) {
    // 로그인 페이지는 제외
    if (pathname === '/admin/login' || pathname === '/login') {
      return NextResponse.next();
    }
    
    // 쿠키에서 토큰 확인
    const token = request.cookies.get('admin-token')?.value;
    
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // 고객 페이지는 토큰 검증을 서버 컴포넌트에서 처리
  // 미들웨어에서는 별도 처리 불필요
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/guest/:path*',
    '/login'
  ]
};
```

### 관리자 레이아웃

**`app/admin/layout.tsx`:**
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
    redirect('/login');
  }
  
  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <a href="/admin">대시보드</a>
        <a href="/admin/reservations">예약 관리</a>
        <a href="/admin/rooms">방 관리</a>
        <a href="/admin/orders">주문 관리</a>
        <button onClick={handleLogout}>로그아웃</button>
      </nav>
      <main>{children}</main>
    </div>
  );
}
```

---

## 🔄 API 호출 구조

### Railway 백엔드 API 호출

**`lib/api.ts`:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ouscaravan-api.railway.app';

// 관리자 API 호출
export async function adminApi(
  endpoint: string,
  options: RequestInit = {}
) {
  // 클라이언트 사이드에서 쿠키 읽기
  const token = typeof window !== 'undefined' 
    ? document.cookie
        .split('; ')
        .find(row => row.startsWith('admin-token='))
        ?.split('=')[1]
    : null;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// 고객 API 호출 (토큰 기반)
export async function guestApi(token: string, endpoint: string = '') {
  const response = await fetch(`${API_URL}/api/guest/${token}${endpoint}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Invalid token');
    }
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

## 📦 패키지 구조

### package.json

```json
{
  "name": "ouscaravan",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "zustand": "^4.0.0",
    "@tanstack/react-query": "^5.0.0",
    "lucide-react": "^0.300.0",
    "framer-motion": "^10.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

## 🚀 Vercel 배포 설정

### vercel.json (선택사항)

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
  ],
  "headers": [
    {
      "source": "/admin/:path*",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### 환경 변수 설정

**Vercel 대시보드 → Project Settings → Environment Variables:**

```env
# Railway 백엔드 API URL
NEXT_PUBLIC_API_URL=https://ouscaravan-api.railway.app

# 관리자 인증
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://ouscaravan.vercel.app

# 웹 앱 URL
NEXT_PUBLIC_WEB_APP_URL=https://ouscaravan.vercel.app

# n8n Webhook URL (선택사항)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/reservation-assigned
```

---

## 📋 파일별 상세 설명

### 1. 루트 레이아웃 (`app/layout.tsx`)

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

### 2. 루트 페이지 (`app/page.tsx`)

```typescript
import { redirect } from 'next/navigation';

export default function HomePage() {
  // 루트 접근 시 관리자 페이지로 리다이렉트 (또는 랜딩 페이지)
  redirect('/admin');
}
```

### 3. 관리자 대시보드 (`app/admin/page.tsx`)

```typescript
import { adminApi } from '@/lib/api';

export default async function AdminDashboard() {
  // Railway 백엔드 API에서 통계 데이터 조회
  const stats = await adminApi('/api/admin/stats');
  
  return (
    <div className="admin-dashboard">
      <h1>대시보드</h1>
      <div className="stats">
        <div>오늘 예약: {stats.todayReservations}</div>
        <div>체크인: {stats.checkins}</div>
        <div>체크아웃: {stats.checkouts}</div>
        <div>주문: {stats.orders}</div>
      </div>
    </div>
  );
}
```

### 4. 고객 홈 페이지 (`app/guest/[token]/page.tsx`)

```typescript
import { guestApi } from '@/lib/api';
import { notFound } from 'next/navigation';

export default async function GuestHomePage({
  params,
}: {
  params: { token: string };
}) {
  try {
    // Railway 백엔드 API에서 예약 정보 조회
    const reservation = await guestApi(params.token);
    
    return (
      <div className="guest-home">
        <h1>안녕하세요, {reservation.guestName}님</h1>
        <ReservationCard reservation={reservation} />
        {/* ... */}
      </div>
    );
  } catch (error) {
    notFound();
  }
}
```

---

## 🔄 배포 프로세스

### 1. GitHub에 코드 푸시

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Vercel 자동 배포

- GitHub에 푸시하면 Vercel이 자동으로 감지
- 빌드 및 배포 자동 실행
- 배포 완료 후 알림

### 3. 배포 확인

- Vercel 대시보드에서 배포 상태 확인
- 배포 URL로 접속하여 테스트
- 관리자 페이지: `https://ouscaravan.vercel.app/admin`
- 고객 페이지: `https://ouscaravan.vercel.app/guest/[token]`

---

## 📊 관리 방법

### 단일 프로젝트 관리의 장점

1. **코드 통합 관리**
   - 하나의 레포지토리에서 모든 코드 관리
   - 공통 컴포넌트 재사용 용이
   - 환경 변수 통합 관리

2. **배포 간소화**
   - 하나의 Vercel 프로젝트로 배포
   - 배포 설정 한 번만 설정
   - 배포 상태 통합 확인

3. **개발 효율성**
   - 로컬 개발 환경 하나만 설정
   - 빌드 시간 단축
   - 디버깅 용이

### 환경별 관리

**Production (프로덕션):**
- `main` 브랜치에 푸시 시 자동 배포
- 도메인: `https://ouscaravan.vercel.app`

**Preview (프리뷰):**
- PR 생성 시 자동 배포
- 도메인: `https://ouscaravan-git-{branch}-{username}.vercel.app`

**Development (로컬):**
- `npm run dev`로 로컬 개발 서버 실행
- 도메인: `http://localhost:3000`

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

### 라우팅 문제

**원인:**
- 라우팅 설정 오류
- 미들웨어 문제

**해결:**
1. `middleware.ts` 설정 확인
2. 라우팅 구조 확인
3. Vercel 배포 로그 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
