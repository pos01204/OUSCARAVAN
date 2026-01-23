# 웹뷰 호환 인증 시스템 개선안

> **작성일**: 2026-01-19  
> **목적**: 외부 앱, 웹뷰 등 모든 환경에서 동작하는 인증 시스템 구현  
> **현재 상태**: 인증 기능 임시 비활성화 (웹뷰 로그인 불가 이슈)

---

## 📋 목차

1. [현재 문제 분석](#1-현재-문제-분석)
2. [웹뷰 인증 실패 원인](#2-웹뷰-인증-실패-원인)
3. [개선 방안 비교](#3-개선-방안-비교)
4. [권장 솔루션: 하이브리드 토큰 인증](#4-권장-솔루션-하이브리드-토큰-인증)
5. [구현 상세](#5-구현-상세)
6. [구현 체크리스트](#6-구현-체크리스트)
7. [테스트 시나리오](#7-테스트-시나리오)

---

## 1. 현재 문제 분석

### 1.1 현재 인증 구조

```
┌─────────────────────────────────────────────────────────┐
│                    현재 인증 흐름                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [로그인 폼] ──▶ [서버 액션] ──▶ [Railway API]          │
│       │              │               │                  │
│       │              │               ▼                  │
│       │              │         JWT 토큰 발급            │
│       │              │               │                  │
│       │              ▼               │                  │
│       │         httpOnly 쿠키 저장 ◀─┘                  │
│       │              │                                  │
│       ▼              ▼                                  │
│  [관리자 페이지] ◀── 쿠키 전송 ──▶ [API 요청]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 현재 코드 구조

**프론트엔드 인증 (`lib/auth.ts`):**
```typescript
// 쿠키에 토큰 저장
cookies().set('admin-token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: data.expiresIn || 60 * 60 * 24 * 7,
  path: '/',
  sameSite: 'lax',  // ⚠️ 웹뷰에서 문제 발생 가능
});
```

**백엔드 인증 미들웨어 (`railway-backend/src/middleware/auth.middleware.ts`):**
```typescript
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.substring(7);
  // JWT 검증...
}
```

### 1.3 임시 비활성화 현황

| 파일 | 변경 내용 |
|------|----------|
| `railway-backend/src/routes/admin.routes.ts` | `authenticate` 미들웨어 주석 처리 |
| `app/(auth)/login/page.tsx` | `/admin`으로 즉시 리다이렉트 |
| `middleware.ts` | 인증 검사 로직 제거 |

---

## 2. 웹뷰 인증 실패 원인

### 2.1 쿠키 기반 인증의 한계

```
┌─────────────────────────────────────────────────────────────────┐
│                    웹뷰에서의 쿠키 문제                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ❌ 문제 1: 서드파티 쿠키 차단                                   │
│  ┌─────────────┐       ┌─────────────┐                         │
│  │ 외부 앱     │──────▶│ 웹뷰        │ 쿠키 접근 불가           │
│  │ (카카오톡)  │       │ (in-app)    │                         │
│  └─────────────┘       └─────────────┘                         │
│                                                                 │
│  ❌ 문제 2: SameSite 속성 제한                                   │
│  - SameSite=Lax: 크로스 사이트 POST 요청에서 쿠키 미전송        │
│  - SameSite=Strict: 외부 링크에서 접근 시 쿠키 미전송           │
│  - SameSite=None: Secure 필수 + 일부 브라우저에서 차단          │
│                                                                 │
│  ❌ 문제 3: 웹뷰 쿠키 격리                                       │
│  - iOS WKWebView: 앱별로 쿠키 저장소 분리                       │
│  - Android WebView: 앱 설정에 따라 쿠키 공유 제한              │
│                                                                 │
│  ❌ 문제 4: 브라우저 정책 변화                                   │
│  - Chrome: 서드파티 쿠키 단계적 폐지                           │
│  - Safari: ITP(Intelligent Tracking Prevention) 적용           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 환경별 쿠키 동작 비교

| 환경 | httpOnly 쿠키 | SameSite=Lax | SameSite=None |
|------|---------------|--------------|---------------|
| **일반 브라우저** | ✅ 정상 | ✅ 정상 | ⚠️ 조건부 |
| **카카오톡 웹뷰** | ⚠️ 제한적 | ❌ 실패 가능 | ⚠️ 제한적 |
| **네이버 웹뷰** | ⚠️ 제한적 | ❌ 실패 가능 | ⚠️ 제한적 |
| **iOS Safari 웹뷰** | ❌ ITP 차단 | ❌ 차단 | ❌ 차단 |
| **Android WebView** | ⚠️ 설정 의존 | ⚠️ 설정 의존 | ⚠️ 설정 의존 |
| **인스타그램 웹뷰** | ⚠️ 제한적 | ❌ 실패 가능 | ⚠️ 제한적 |

### 2.3 현재 시스템의 구체적 문제점

1. **서버 액션 + httpOnly 쿠키 조합**
   - Next.js 서버 액션에서 설정한 쿠키가 웹뷰에서 유지되지 않음
   - 서버 컴포넌트에서 쿠키를 읽을 때 웹뷰에서 전송되지 않음

2. **리다이렉트 기반 인증 흐름**
   - 로그인 후 리다이렉트 시 쿠키가 함께 전달되지 않는 경우 발생
   - SameSite=Lax는 GET 요청에서만 쿠키 전송 허용

3. **API 호출 시 쿠키 미전송**
   - 클라이언트 컴포넌트에서 API 호출 시 `credentials: 'include'` 필요
   - 웹뷰에서는 이 옵션이 있어도 쿠키가 전송되지 않는 경우 발생

---

## 3. 개선 방안 비교

### 3.1 방안 비교표

| 방안 | 웹뷰 호환성 | 보안성 | 구현 복잡도 | 권장 |
|------|-------------|--------|-------------|------|
| **A. Authorization 헤더 + localStorage** | ✅ 높음 | ⚠️ 중간 | ⭐⭐ 낮음 | ✅ |
| **B. URL 토큰 + 메모리 저장** | ✅ 높음 | ⚠️ 중간 | ⭐⭐ 낮음 | ⚠️ |
| **C. 하이브리드 (쿠키 + 헤더)** | ✅ 높음 | ✅ 높음 | ⭐⭐⭐ 중간 | ✅✅ |
| **D. OAuth 2.0 + PKCE** | ✅ 높음 | ✅ 높음 | ⭐⭐⭐⭐ 높음 | - |

### 3.2 방안별 상세

#### 방안 A: Authorization 헤더 + localStorage

```
장점:
├── 웹뷰에서 안정적으로 동작
├── 구현이 간단
├── 기존 백엔드 코드와 호환
└── 모든 브라우저/환경에서 동일하게 동작

단점:
├── XSS 공격에 취약 (토큰 탈취 가능)
├── httpOnly 속성 사용 불가
└── 클라이언트에서 토큰 관리 필요
```

#### 방안 B: URL 토큰 + 메모리 저장

```
장점:
├── 초기 진입 시 토큰 전달 용이
├── 웹뷰에서 확실히 동작
└── localStorage 없이도 동작

단점:
├── URL에 토큰 노출 (보안 위험)
├── 링크 공유 시 토큰 유출 가능
├── 새로고침 시 재인증 필요
└── 브라우저 히스토리에 토큰 기록
```

#### 방안 C: 하이브리드 (쿠키 + 헤더) - **권장**

```
장점:
├── 일반 브라우저: 쿠키로 보안 유지
├── 웹뷰: Authorization 헤더로 폴백
├── 최대한의 보안성 + 호환성
└── 점진적 적용 가능

단점:
├── 구현 복잡도 증가
├── 두 가지 인증 방식 관리 필요
└── 테스트 케이스 증가
```

---

## 4. 권장 솔루션: 하이브리드 토큰 인증

### 4.1 개선된 인증 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                    개선된 인증 흐름                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [로그인 폼] ──▶ [API 호출] ──▶ [Railway API]                   │
│       │              │               │                          │
│       │              │               ▼                          │
│       │              │         JWT 토큰 발급                    │
│       │              │               │                          │
│       │              ▼               │                          │
│       │    ┌─────────────────────────┴─────────────────────┐   │
│       │    │                                               │   │
│       │    │  1. localStorage에 토큰 저장 (클라이언트)     │   │
│       │    │  2. 선택적: httpOnly 쿠키도 설정 (서버)       │   │
│       │    │                                               │   │
│       │    └───────────────────────────────────────────────┘   │
│       │              │                                          │
│       ▼              ▼                                          │
│  [관리자 페이지] ◀── API 호출 시                                │
│                      │                                          │
│                      ├── 1순위: Authorization 헤더              │
│                      └── 2순위: 쿠키 (폴백)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 토큰 우선순위 결정 로직

```
┌────────────────────────────────────────────────────────────┐
│                   백엔드 인증 미들웨어                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  요청 수신                                                 │
│      │                                                     │
│      ▼                                                     │
│  ┌────────────────────────────────┐                       │
│  │ Authorization 헤더 확인        │                       │
│  │ (Bearer 토큰)                  │                       │
│  └──────────────┬─────────────────┘                       │
│                 │                                          │
│        ┌───────┴───────┐                                  │
│        │               │                                  │
│       있음            없음                                 │
│        │               │                                  │
│        ▼               ▼                                  │
│  토큰 검증      ┌────────────────────┐                    │
│        │       │ 쿠키에서 토큰 확인  │                    │
│        │       │ (admin-token)       │                    │
│        │       └──────────┬──────────┘                    │
│        │                  │                               │
│        │         ┌───────┴───────┐                       │
│        │         │               │                       │
│        │        있음            없음                      │
│        │         │               │                       │
│        │         ▼               ▼                       │
│        │    토큰 검증       401 Unauthorized              │
│        │         │                                        │
│        ▼         ▼                                        │
│  ┌─────────────────────┐                                 │
│  │ 인증 성공 → next()  │                                 │
│  └─────────────────────┘                                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 4.3 핵심 설계 원칙

1. **토큰 저장**: localStorage (클라이언트) + 선택적 쿠키 (서버)
2. **토큰 전송**: Authorization 헤더 우선, 쿠키 폴백
3. **토큰 갱신**: Refresh Token 방식 또는 자동 재로그인
4. **보안 강화**: XSS 방어 + CSRF 보호 + 토큰 만료 관리

---

## 5. 구현 상세

### 5.1 백엔드: 개선된 인증 미들웨어

**파일: `railway-backend/src/middleware/auth.middleware.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

/**
 * 하이브리드 인증 미들웨어
 * 1순위: Authorization 헤더 (Bearer 토큰)
 * 2순위: 쿠키 (admin-token)
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Authorization 헤더에서 토큰 추출 (우선)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
    console.log('[Auth] Token from Authorization header');
  }
  
  // 2. 쿠키에서 토큰 추출 (폴백)
  if (!token && req.cookies && req.cookies['admin-token']) {
    token = req.cookies['admin-token'];
    console.log('[Auth] Token from cookie (fallback)');
  }

  // 토큰 없음
  if (!token) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다.',
    });
  }
  
  // 토큰 검증
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
      message: '인증 토큰이 유효하지 않습니다. 다시 로그인해주세요.',
    });
  }
}

/**
 * n8n API Key 인증 (자동화용)
 */
export function authenticateApiKey(req: AuthRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.N8N_API_KEY;

  if (!validApiKey) {
    console.error('[Auth] N8N_API_KEY not configured');
    return res.status(500).json({
      error: 'Server configuration error',
      code: 'CONFIG_ERROR',
    });
  }

  if (apiKey === validApiKey) {
    console.log('[Auth] API Key authentication successful');
    next();
  } else {
    return res.status(401).json({
      error: 'Invalid API key',
      code: 'INVALID_API_KEY',
    });
  }
}

/**
 * 사용자 인증 또는 API Key 인증 (둘 중 하나)
 */
export function authenticateOrApiKey(req: AuthRequest, res: Response, next: NextFunction) {
  // API Key가 있으면 API Key 인증 시도
  if (req.headers['x-api-key']) {
    return authenticateApiKey(req, res, next);
  }
  
  // 그 외에는 사용자 인증
  return authenticate(req, res, next);
}
```

### 5.2 백엔드: 쿠키 파서 미들웨어 추가

**파일: `railway-backend/src/app.ts`** (수정)

```typescript
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';  // 추가 필요
import dotenv from 'dotenv';
// ... 기존 imports

dotenv.config();

const app = express();

// 미들웨어
app.use(cookieParser());  // 쿠키 파싱 추가
app.use(cors({
  origin: (origin, callback) => {
    // 기존 CORS 로직...
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));
app.use(express.json());

// ... 나머지 코드
```

### 5.3 프론트엔드: 토큰 관리 유틸리티

**파일: `lib/auth-client.ts`** (새 파일)

```typescript
/**
 * 클라이언트 사이드 인증 유틸리티
 * 웹뷰 호환을 위해 localStorage 기반 토큰 관리
 */

const TOKEN_KEY = 'admin-token';
const TOKEN_EXPIRY_KEY = 'admin-token-expiry';

/**
 * 토큰 저장
 */
export function saveToken(token: string, expiresIn: number = 7 * 24 * 60 * 60) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(TOKEN_KEY, token);
    
    // 만료 시간 저장 (현재 시간 + expiresIn 초)
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    console.log('[AuthClient] Token saved, expires:', new Date(expiryTime));
  } catch (error) {
    console.error('[AuthClient] Failed to save token:', error);
  }
}

/**
 * 토큰 조회
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    // 토큰이 없으면 null
    if (!token) return null;
    
    // 만료 확인
    if (expiry && Date.now() > parseInt(expiry)) {
      console.log('[AuthClient] Token expired, clearing');
      clearToken();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('[AuthClient] Failed to get token:', error);
    return null;
  }
}

/**
 * 토큰 삭제
 */
export function clearToken() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    console.log('[AuthClient] Token cleared');
  } catch (error) {
    console.error('[AuthClient] Failed to clear token:', error);
  }
}

/**
 * 로그인 상태 확인
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Authorization 헤더 생성
 */
export function getAuthHeader(): { Authorization: string } | {} {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
```

### 5.4 프론트엔드: 개선된 API 호출 함수

**파일: `lib/api.ts`** (수정)

```typescript
import { getToken, getAuthHeader, clearToken } from './auth-client';

/**
 * 인증이 필요한 API 호출 (웹뷰 호환)
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Authorization 헤더 추가 (토큰이 있을 때)
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // 쿠키도 함께 전송 (폴백용)
  });
  
  // 401 에러 시 토큰 클리어 및 리다이렉트
  if (response.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?error=session_expired';
    }
    throw new Error('Session expired');
  }
  
  return response;
}

/**
 * 관리자 API 호출 (개선)
 */
export async function adminApi(
  endpoint: string,
  options: RequestInit = {}
) {
  try {
    const response = await authenticatedFetch(`${API_URL}${endpoint}`, options);
    
    if (!response.ok) {
      // 기존 에러 처리 로직...
    }
    
    return response.json();
  } catch (error) {
    // 기존 에러 처리 로직...
  }
}
```

### 5.5 프론트엔드: 로그인 페이지 (클라이언트 컴포넌트)

**파일: `app/(auth)/login/page.tsx`** (교체)

```typescript
'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveToken } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // URL에서 에러 파라미터 읽기
  const urlError = searchParams.get('error');
  
  const errorMessages: Record<string, string> = {
    invalid_credentials: '아이디 또는 비밀번호가 올바르지 않습니다.',
    session_expired: '세션이 만료되었습니다. 다시 로그인해주세요.',
    network_error: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    timeout: '서버 응답 시간이 초과되었습니다.',
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const id = formData.get('id') as string;
    const password = formData.get('password') as string;
    
    try {
      // API 서버로 직접 로그인 요청
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, password }),
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          setError(errorMessages.invalid_credentials);
        } else {
          setError('로그인에 실패했습니다.');
        }
        return;
      }
      
      const data = await response.json();
      
      // localStorage에 토큰 저장
      saveToken(data.token, data.expiresIn);
      
      // 관리자 페이지로 이동
      router.push('/admin');
      
    } catch (err) {
      console.error('[Login] Error:', err);
      setError(errorMessages.network_error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            OUSCARAVAN 관리자
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {(error || urlError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error || errorMessages[urlError] || '오류가 발생했습니다.'}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="id" className="block text-sm font-medium mb-1">
                아이디
              </label>
              <Input
                id="id"
                name="id"
                type="text"
                required
                placeholder="관리자 아이디"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                비밀번호
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="비밀번호"
                disabled={isLoading}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="text-center text-xs text-gray-500">
          OUSCARAVAN 관리 시스템
        </CardFooter>
      </Card>
    </div>
  );
}
```

### 5.6 프론트엔드: 인증 상태 확인 래퍼

**파일: `components/admin/AuthGuard.tsx`** (새 파일)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getToken } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // 클라이언트에서 인증 상태 확인
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      
      if (!authenticated) {
        router.replace('/login');
        return;
      }
      
      setIsAuthed(true);
      setIsChecking(false);
    };
    
    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return <>{children}</>;
}
```

### 5.7 프론트엔드: 관리자 레이아웃 수정

**파일: `app/admin/layout.tsx`** (수정)

```typescript
import { AuthGuard } from '@/components/admin/AuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* 기존 레이아웃 코드 */}
        {children}
      </div>
    </AuthGuard>
  );
}
```

### 5.8 백엔드: 라우트에 인증 미들웨어 활성화

**파일: `railway-backend/src/routes/admin.routes.ts`** (수정)

```typescript
import express from 'express';
import { authenticateOrApiKey } from '../middleware/auth.middleware';
// ... 기존 imports

const router = express.Router();

// 인증 미들웨어 활성화
router.use(authenticateOrApiKey);

// 예약 관리
router.get('/reservations', listReservations);
router.get('/reservations/:id', getReservation);
// ... 나머지 라우트
```

---

## 6. 구현 체크리스트

### 6.1 백엔드 작업

- [ ] `cookie-parser` 패키지 설치
  ```bash
  cd railway-backend
  npm install cookie-parser
  npm install -D @types/cookie-parser
  ```

- [ ] `app.ts`에 쿠키 파서 미들웨어 추가

- [ ] `auth.middleware.ts` 하이브리드 인증으로 수정

- [ ] `admin.routes.ts` 인증 미들웨어 활성화

- [ ] 환경 변수 설정
  - `JWT_SECRET`: 프로덕션용 시크릿 키
  - `N8N_API_KEY`: n8n 자동화용 API 키

### 6.2 프론트엔드 작업

- [ ] `lib/auth-client.ts` 파일 생성

- [ ] `lib/api.ts` 인증 헤더 로직 추가

- [ ] `app/(auth)/login/page.tsx` 클라이언트 컴포넌트로 교체

- [ ] `components/admin/AuthGuard.tsx` 파일 생성

- [ ] `app/admin/layout.tsx` AuthGuard 적용

- [ ] `middleware.ts` 업데이트 (선택적)

### 6.3 환경 변수 설정

**Railway 환경 변수:**
```
JWT_SECRET=<강력한-시크릿-키-32자-이상>
N8N_API_KEY=<n8n-자동화용-API-키>
```

**Vercel 환경 변수:**
```
NEXT_PUBLIC_API_URL=https://ouscaravan-production.up.railway.app
```

---

## 7. 테스트 시나리오

### 7.1 테스트 환경 체크리스트

| 환경 | 테스트 방법 | 예상 결과 |
|------|------------|----------|
| **일반 브라우저 (Chrome)** | 직접 URL 접근 | ✅ 로그인 후 정상 동작 |
| **일반 브라우저 (Safari)** | 직접 URL 접근 | ✅ 로그인 후 정상 동작 |
| **모바일 Safari** | iPhone에서 접근 | ✅ 로그인 후 정상 동작 |
| **모바일 Chrome** | Android에서 접근 | ✅ 로그인 후 정상 동작 |
| **카카오톡 웹뷰** | 카카오톡에서 링크 클릭 | ✅ 로그인 후 정상 동작 |
| **네이버 앱 웹뷰** | 네이버 앱에서 링크 클릭 | ✅ 로그인 후 정상 동작 |
| **인스타그램 웹뷰** | 인스타그램에서 링크 클릭 | ✅ 로그인 후 정상 동작 |

### 7.2 기능별 테스트

```
1. 로그인 테스트
   ├── [ ] 올바른 자격증명으로 로그인 성공
   ├── [ ] 잘못된 자격증명으로 로그인 실패 + 에러 메시지
   ├── [ ] 로그인 후 토큰이 localStorage에 저장됨
   └── [ ] 로그인 후 /admin으로 리다이렉트

2. 인증 유지 테스트
   ├── [ ] 페이지 새로고침 후에도 로그인 상태 유지
   ├── [ ] 다른 관리자 페이지 이동 시 로그인 유지
   └── [ ] API 호출 시 Authorization 헤더 포함 확인

3. 로그아웃 테스트
   ├── [ ] 로그아웃 시 토큰 삭제
   └── [ ] 로그아웃 후 /login으로 리다이렉트

4. 세션 만료 테스트
   ├── [ ] 토큰 만료 후 API 호출 시 401 응답
   ├── [ ] 401 응답 시 자동으로 /login 리다이렉트
   └── [ ] 만료 메시지 표시

5. 보안 테스트
   ├── [ ] 토큰 없이 /admin 접근 시 로그인 페이지로 리다이렉트
   ├── [ ] 잘못된 토큰으로 API 호출 시 401 응답
   └── [ ] n8n API Key로 관리자 API 호출 가능
```

### 7.3 웹뷰 특화 테스트

```
1. 카카오톡 테스트
   ├── [ ] 카카오톡 채팅에서 관리자 링크 공유
   ├── [ ] 링크 클릭 → 웹뷰에서 열기
   ├── [ ] 로그인 진행
   ├── [ ] 로그인 성공 후 관리자 페이지 접근
   └── [ ] 페이지 이동 및 API 호출 정상 동작

2. 네이버 앱 테스트
   ├── [ ] 네이버 앱에서 관리자 링크 접근
   ├── [ ] 로그인 진행
   └── [ ] 정상 동작 확인

3. 외부 브라우저 전환 테스트
   ├── [ ] 웹뷰에서 "외부 브라우저로 열기" 선택
   ├── [ ] 외부 브라우저에서 로그인
   └── [ ] 정상 동작 확인
```

---

## 8. 추가 보안 고려사항

### 8.1 XSS 방어

localStorage 사용 시 XSS 공격에 주의가 필요합니다:

```typescript
// lib/security.ts에 추가
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

### 8.2 토큰 갱신 (선택적)

장기 세션이 필요한 경우 Refresh Token 도입 고려:

```typescript
// 토큰 갱신 API
POST /api/auth/refresh
{
  "refreshToken": "..."
}

// 응답
{
  "token": "new-access-token",
  "expiresIn": 3600,
  "refreshToken": "new-refresh-token"
}
```

### 8.3 토큰 무효화

로그아웃 시 서버 측 토큰 무효화:

```typescript
// 블랙리스트 또는 버전 관리
POST /api/auth/logout
Authorization: Bearer <token>

// 서버에서 토큰 무효화 처리
```

---

## 9. 마이그레이션 계획

### 9.1 단계별 적용

```
Phase 1: 준비 (1일)
├── 백엔드 코드 수정 및 테스트
├── cookie-parser 설치
└── 인증 미들웨어 업데이트

Phase 2: 프론트엔드 수정 (1일)
├── auth-client.ts 생성
├── 로그인 페이지 수정
├── AuthGuard 컴포넌트 생성
└── API 호출 함수 수정

Phase 3: 통합 테스트 (1일)
├── 로컬 환경 테스트
├── 다양한 브라우저 테스트
└── 웹뷰 환경 테스트

Phase 4: 배포 (0.5일)
├── Railway 배포 (백엔드)
├── Vercel 배포 (프론트엔드)
└── 프로덕션 테스트

Phase 5: 모니터링 (지속)
├── 에러 로그 모니터링
├── 사용자 피드백 수집
└── 필요시 롤백 준비
```

### 9.2 롤백 계획

문제 발생 시 빠른 롤백을 위해:

1. 백엔드: `authenticateOrApiKey` 미들웨어 주석 처리
2. 프론트엔드: AuthGuard 제거, 기존 리다이렉트 복원

---

*본 문서는 웹뷰 환경에서의 인증 문제 해결을 위한 기술 가이드입니다. 구현 전 보안 검토를 권장합니다.*
