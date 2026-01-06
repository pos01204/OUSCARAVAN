'use client';

import { useEffect } from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logError } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    logError('Application error occurred', error, {
      digest: error.digest,
      component: 'ErrorBoundary',
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>오류가 발생했습니다</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              오류 코드: {error.digest}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline" className="flex-1">
              다시 시도
            </Button>
            <Button asChild className="flex-1 gap-2">
              <a href="/login">
                <Home className="h-4 w-4" />
                로그인으로
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
