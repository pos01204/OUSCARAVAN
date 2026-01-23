'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function isKakaoInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /KAKAOTALK/i.test(navigator.userAgent);
}

function getReturnUrl(): string {
  if (typeof window === 'undefined') return '/';
  const params = new URLSearchParams(window.location.search);
  const ret = params.get('returnUrl');
  return ret && ret.startsWith('/') ? ret : '/';
}

export default function InAppPage() {
  const [returnUrl, setReturnUrl] = useState('/');
  const isKakao = useMemo(() => isKakaoInAppBrowser(), []);

  useEffect(() => {
    setReturnUrl(getReturnUrl());
  }, []);

  const openExternal = () => {
    // 대부분의 모바일 브라우저에서 새 창(외부 브라우저) 열기 동작을 유도
    // 카카오 인앱에서는 "외부 브라우저로 열기"를 사용자에게 유도하는 것이 가장 확실한 해결책
    window.open(returnUrl, '_blank', 'noopener,noreferrer');
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + returnUrl);
      alert('링크를 복사했습니다. 외부 브라우저(Chrome/Safari)에서 붙여넣어 열어주세요.');
    } catch {
      alert('복사에 실패했습니다. 주소창의 링크를 길게 눌러 복사 후 외부 브라우저에서 열어주세요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>인앱 브라우저 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            현재 <strong>카카오톡 인앱 브라우저</strong>에서 접속 중입니다.
            일부 기능(로그인/실시간 알림 등)이 인앱 브라우저 정책으로 인해 정상 동작하지 않을 수 있습니다.
          </p>
          <div className="space-y-2">
            <Button className="w-full" onClick={openExternal}>
              외부 브라우저로 열기
            </Button>
            <Button variant="outline" className="w-full" onClick={copyUrl}>
              링크 복사
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => (window.location.href = returnUrl)}>
              계속 진행(권장하지 않음)
            </Button>
          </div>
          {!isKakao && (
            <p className="text-xs text-muted-foreground">
              (참고) 카카오톡이 아닌 경우에도 인앱 브라우저라면 외부 브라우저 이용을 권장합니다.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

