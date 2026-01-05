'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CHECK_IN_OUT } from '@/lib/constants';
import {
  requestNotificationPermission,
  scheduleCheckoutReminder,
  showNotification,
} from '@/lib/notifications';
import { useGuestStore } from '@/lib/store';

export function CheckoutReminder() {
  const { isCheckedIn, isCheckedOut, guestInfo } = useGuestStore();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 체크인되어 있고 체크아웃하지 않은 경우에만 알림 설정
    if (!isCheckedIn || isCheckedOut || dismissed) {
      return;
    }

    // 알림 권한 요청
    requestNotificationPermission().then((granted) => {
      if (granted) {
        setNotificationEnabled(true);
        
        // 체크아웃 1시간 전 알림 스케줄링
        const cleanup = scheduleCheckoutReminder(
          CHECK_IN_OUT.checkOut,
          () => {
            showNotification('체크아웃 알림', {
              body: '체크아웃 시간까지 1시간 남았습니다. 준비해주세요!',
              tag: 'checkout-reminder',
            });
          }
        );

        return cleanup;
      }
    });
  }, [isCheckedIn, isCheckedOut, dismissed]);

  // 알림 배너 표시 (체크인 후 체크아웃 전)
  if (!isCheckedIn || isCheckedOut || dismissed || !notificationEnabled) {
    return null;
  }

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">체크아웃 알림이 설정되었습니다</p>
            <p className="text-xs text-muted-foreground">
              체크아웃 1시간 전에 알림을 받으실 수 있습니다
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
