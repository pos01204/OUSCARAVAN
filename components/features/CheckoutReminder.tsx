'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CHECK_IN_OUT } from '@/lib/constants';
import { alarmService } from '@/lib/alarm-service';
import { useGuestStore } from '@/lib/store';

export function CheckoutReminder() {
  const { isCheckedIn, isCheckedOut } = useGuestStore();
  const [alarmScheduled, setAlarmScheduled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const [setupFailed, setSetupFailed] = useState(false);
  const [alarmId, setAlarmId] = useState<string | null>(null);
  const alarmIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 체크인되어 있고 체크아웃하지 않은 경우에만 알람 설정
    if (!isCheckedIn || isCheckedOut || dismissed) {
      return;
    }

    // Service Worker 초기화 및 알람 설정
    const setupAlarm = async () => {
      try {
        // Service Worker 초기화
        const initialized = await alarmService.initialize();
        if (!initialized) {
          console.warn('[CheckoutReminder] Service Worker 초기화 실패');
          setSetupFailed(true);
          return;
        }

        setServiceWorkerReady(true);

        // 체크아웃 시간 파싱 (예: "11:00")
        const [hours, minutes] = CHECK_IN_OUT.checkOut.split(':').map(Number);
        
        // 오늘 날짜로 체크아웃 시간 설정
        const today = new Date();
        const checkoutDate = new Date(today);
        checkoutDate.setHours(hours, minutes, 0, 0);
        
        // 체크아웃 시간이 이미 지났다면 내일로 설정
        if (checkoutDate < today) {
          checkoutDate.setDate(checkoutDate.getDate() + 1);
        }
        
        // 1시간 전 시간 계산
        const reminderTime = new Date(checkoutDate);
        reminderTime.setHours(reminderTime.getHours() - 1);
        
        const now = new Date();
        
        // 이미 1시간 전이 지났다면 체크아웃 30분 전으로 설정
        if (reminderTime <= now) {
          reminderTime.setTime(checkoutDate.getTime() - 30 * 60 * 1000);
          
          // 그래도 지났다면 체크아웃 10분 전으로 설정
          if (reminderTime <= now) {
            reminderTime.setTime(checkoutDate.getTime() - 10 * 60 * 1000);
          }
        }

        // 알람 스케줄링
        const id = await alarmService.scheduleAlarm(
          reminderTime,
          '체크아웃 알림',
          '체크아웃 시간까지 1시간 남았습니다. 준비해주세요!',
          'checkout-reminder'
        );

        setAlarmId(id);
        alarmIdRef.current = id;
        setAlarmScheduled(true);
        
        console.log(`[CheckoutReminder] 알람 설정 완료: ${reminderTime.toLocaleString()}`);
      } catch (error) {
        console.error('[CheckoutReminder] 알람 설정 실패:', error);
        setSetupFailed(true);
      }
    };

    setupAlarm();

    // 컴포넌트 언마운트 시 알람 취소
    return () => {
      if (alarmIdRef.current) {
        alarmService.cancelAlarm(alarmIdRef.current).catch(console.error);
      }
    };
  }, [isCheckedIn, isCheckedOut, dismissed]);

  // 알람 배너 닫기
  const handleDismiss = async () => {
    if (alarmId) {
      await alarmService.cancelAlarm(alarmId);
    }
    setDismissed(true);
  };

  // 배너 표시 조건
  if (!isCheckedIn || isCheckedOut || dismissed) {
    return null;
  }

  // 알림 설정 실패 시 대체 안내(환경/권한 이슈)
  if (setupFailed && !alarmScheduled) {
    return (
      <Card variant="alert">
        <CardContent className="flex items-start justify-between gap-3 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-amber-900">체크아웃 알림을 설정할 수 없어요</p>
              <p className="mt-1 text-xs text-amber-800/90">
                브라우저/권한 설정에 따라 알림이 제한될 수 있어요. 체크아웃 시간({CHECK_IN_OUT.checkOut}) 전에 한 번 더 확인해주세요.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8"
            aria-label="알림 닫기"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 알람 배너 표시 (알람이 설정된 경우)
  if (!alarmScheduled) return null;

  return (
    <Card variant="info">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {serviceWorkerReady ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <Bell className="h-5 w-5 text-primary" />
          )}
          <div>
            <p className="text-sm font-medium">
              {serviceWorkerReady
                ? '체크아웃 알림이 설정되었습니다'
                : '알림 설정 중...'}
            </p>
            <p className="text-xs text-muted-foreground">
              {serviceWorkerReady
                ? '브라우저를 닫아도 알림을 받으실 수 있습니다'
                : '잠시만 기다려주세요'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-8 w-8"
          aria-label="알림 닫기"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
