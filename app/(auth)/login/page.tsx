'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveToken } from '@/lib/auth-client';
import { API_CONFIG } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

// 에러 메시지 매핑
const errorMessages: Record<string, string> = {
  invalid_credentials: '아이디 또는 비밀번호가 올바르지 않습니다.',
  session_expired: '세션이 만료되었습니다. 다시 로그인해주세요.',
  network_error: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  timeout: '서버 응답 시간이 초과되었습니다.',
  server_error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // URL에서 에러 파라미터 읽기
  const urlError = searchParams.get('error');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const id = formData.get('id') as string;
    const password = formData.get('password') as string;
    
    // 입력값 검증
    if (!id || !password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('[Login] Attempting login...');
      
      // API 서버로 직접 로그인 요청 (웹뷰 호환)
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, password }),
        }
      );
      
      console.log('[Login] Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          setError(errorMessages.invalid_credentials);
        } else if (response.status >= 500) {
          setError(errorMessages.server_error);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.message || '로그인에 실패했습니다.');
        }
        return;
      }
      
      const data = await response.json();
      console.log('[Login] Login successful, token received');
      
      // localStorage에 토큰 저장 (웹뷰 호환)
      saveToken(data.token, data.expiresIn);
      
      // 관리자 페이지로 이동
      console.log('[Login] Redirecting to /admin');
      router.push('/admin');
      
    } catch (err) {
      console.error('[Login] Error:', err);
      
      // 네트워크 오류 처리
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(errorMessages.network_error);
      } else {
        setError(errorMessages.network_error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl font-bold text-primary">OUS</span>
          </div>
          <CardTitle className="text-2xl font-bold">
            OUSCARAVAN 관리자
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            관리자 계정으로 로그인해주세요
          </p>
        </CardHeader>
        
        <CardContent>
          {/* 에러 메시지 표시 */}
          {(error || urlError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error || errorMessages[urlError] || '오류가 발생했습니다.'}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="id" className="block text-sm font-medium">
                아이디
              </label>
              <Input
                id="id"
                name="id"
                type="text"
                required
                placeholder="관리자 아이디를 입력하세요"
                disabled={isLoading}
                autoComplete="username"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                비밀번호
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="비밀번호를 입력하세요"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col items-center text-xs text-gray-500 space-y-1">
          <p>OUSCARAVAN 예약 관리 시스템</p>
          <p className="text-gray-400">© 2026 OUSCARAVAN. All rights reserved.</p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Suspense로 감싸서 useSearchParams 사용
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
