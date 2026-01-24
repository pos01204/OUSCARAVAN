'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA 설치 안내 컴포넌트
 * 모바일에서 앱을 설치하면 백그라운드 알림이 더 잘 작동합니다.
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 이미 설치되어 있는지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // 설치 가능 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 로컬 스토리지에서 이전에 닫았는지 확인
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    // 앱 설치 완료 이벤트
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // 설치 프롬프트 표시
      await deferredPrompt.prompt();
      
      // 사용자 선택 대기
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWAInstallPrompt] 사용자가 앱 설치를 수락했습니다');
        setShowPrompt(false);
      } else {
        console.log('[PWAInstallPrompt] 사용자가 앱 설치를 거부했습니다');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('[PWAInstallPrompt] 설치 중 오류:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 7일간 다시 표시하지 않음
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // 이미 설치되었거나 프롬프트를 표시하지 않아야 하는 경우
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Card variant="info" className="mb-4">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1">
          <Download className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">앱 설치하기</p>
            <p className="text-xs text-muted-foreground">
              앱을 설치하면 브라우저를 닫아도 알림을 받을 수 있습니다
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleInstall}
            className="text-xs"
          >
            설치
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
