'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminNotificationService } from '@/lib/admin-notification-service';

/**
 * 관리자 알림 설정 컴포넌트
 * 알림 권한 요청 및 Service Worker 초기화
 */
export function AdminNotificationSetup() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 인앱(WebView) 등 Notification 미지원 환경에서는 초기화 자체를 하지 않음(크래시/불필요 동작 방지)
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setDismissed(true);
      return;
    }

    // Service Worker 초기화
    const initServiceWorker = async () => {
      const ready = await adminNotificationService.initialize();
      setIsServiceWorkerReady(ready);
    };

    initServiceWorker();

    // 알림 권한 상태 확인
    const checkPermission = () => {
      const status = adminNotificationService.getPermissionStatus();
      setPermissionStatus(status);
    };

    checkPermission();

    // 주기적으로 권한 상태 확인 (사용자가 브라우저 설정에서 변경할 수 있음)
    const interval = setInterval(checkPermission, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRequestPermission = async () => {
    const granted = await adminNotificationService.requestPermission();
    if (granted) {
      setPermissionStatus('granted');
    } else {
      setPermissionStatus('denied');
    }
  };

  // 권한이 허용되었거나 거부되었거나, Service Worker가 준비되지 않았거나, 닫혔으면 표시하지 않음
  if (
    permissionStatus === 'granted' ||
    permissionStatus === 'denied' ||
    !isServiceWorkerReady ||
    dismissed
  ) {
    return null;
  }

  return (
    <Card variant="info" className="mb-4">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1">
          <Bell className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">모바일 알림 설정</p>
            <p className="text-xs text-muted-foreground">
              브라우저를 닫아도 체크인/체크아웃 및 주문 알림을 받을 수 있습니다
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleRequestPermission}
            className="text-xs"
          >
            허용
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
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

/**
 * 알림 권한 상태 표시 컴포넌트 (작은 배지 형태)
 */
export function AdminNotificationStatus() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const ready = await adminNotificationService.initialize();
      setIsServiceWorkerReady(ready);
      
      const status = adminNotificationService.getPermissionStatus();
      setPermissionStatus(status);
    };

    init();

    const interval = setInterval(() => {
      const status = adminNotificationService.getPermissionStatus();
      setPermissionStatus(status);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (permissionStatus === 'granted' && isServiceWorkerReady) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 text-green-500" />
        <span className="hidden md:inline">알림 활성화</span>
      </div>
    );
  }

  return null;
}
