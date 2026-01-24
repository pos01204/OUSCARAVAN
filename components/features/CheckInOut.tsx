'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { Button } from '@/components/ui/button';
import { useGuestStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { PermissionState } from '@/components/shared/PermissionState';
import { checkIn as apiCheckIn, checkOut as apiCheckOut, guestApi, sendCheckInToN8N, sendCheckOutToN8N } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CheckInOutProps {
  token?: string;
}

export function CheckInOut({ token }: CheckInOutProps = {}) {
  const { isCheckedIn, isCheckedOut, checkIn, checkOut, guestInfo } =
    useGuestStore();
  if (!token) {
    return (
      <PermissionState
        title="접속 정보가 없어요"
        description="홈 화면에서 다시 접속해 주세요."
      />
    );
  }

  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [checklist, setChecklist] = useState({
    gasLocked: false,
    trashCleaned: false,
  });
  const { toast } = useToast();

  const checklistTotal = 2;
  const checklistDone = useMemo(() => {
    return [checklist.gasLocked, checklist.trashCleaned].filter(Boolean).length;
  }, [checklist.gasLocked, checklist.trashCleaned]);
  const checklistPercent = Math.round((checklistDone / checklistTotal) * 100);
  const isChecklistComplete = checklistDone === checklistTotal;

  // 서버 상태와 주기적으로 동기화(새로고침/다른 기기/관리자 변경 등)
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const sync = async () => {
      try {
        const reservation = await guestApi(token);
        if (cancelled) return;
        const status = reservation?.status;
        if (status === 'checked_in') {
          if (!useGuestStore.getState().isCheckedIn) useGuestStore.getState().checkIn();
        } else if (status === 'checked_out') {
          if (!useGuestStore.getState().isCheckedIn) useGuestStore.getState().checkIn();
          if (!useGuestStore.getState().isCheckedOut) useGuestStore.getState().checkOut();
        }
        setLastSyncedAt(new Date());
      } catch {
        // 동기화 실패는 조용히(오프라인/일시 장애 가능)
      }
    };

    sync();
    const id = window.setInterval(sync, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [token]);

  const handleCheckIn = async () => {
    if (!token) {
      toast({
        title: '접속 정보가 없어요',
        description: '홈 화면에서 다시 접속해 주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setActionError(null);
    
    try {
      // 1. Railway 백엔드에 체크인 상태 저장
      await apiCheckIn(token);
      
      // 2. 로컬 상태 업데이트
      checkIn();
      
      // 3. n8n 웹훅으로 알림 전송 (비동기, 실패해도 체크인은 저장됨)
      sendCheckInToN8N({
        guest: guestInfo.name,
        room: guestInfo.room,
        checkinTime: new Date().toISOString(),
        source: 'web_app',
      }).catch((error) => {
        console.error('Failed to send check-in notification to n8n:', error);
        // n8n 전송 실패는 로그만 남기고 사용자에게는 알리지 않음
      });
      
      toast({
        title: '체크인이 완료됐어요',
        description: '즐거운 시간 보내세요!',
      });
    } catch (error) {
      console.error('Failed to check in:', error);
      setActionError('체크인 처리에 실패했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
      toast({
        title: '체크인이 잘 안 됐어요',
        description: '네트워크 상태를 확인한 뒤 다시 시도해 주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (!token) {
      toast({
        title: '접속 정보가 없어요',
        description: '홈 화면에서 다시 접속해 주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (!isChecklistComplete) return;

    setIsProcessing(true);
    setActionError(null);
    
    try {
      // 1. Railway 백엔드에 체크아웃 상태 저장
      await apiCheckOut(token, checklist);
      
      // 2. 로컬 상태 업데이트
      checkOut();
      
      // 3. n8n 웹훅으로 알림 전송 (비동기, 실패해도 체크아웃은 저장됨)
      sendCheckOutToN8N({
        guest: guestInfo.name,
        room: guestInfo.room,
        checkoutTime: new Date().toISOString(),
        checklist,
      }).catch((error) => {
        console.error('Failed to send check-out notification to n8n:', error);
        // n8n 전송 실패는 로그만 남기고 사용자에게는 알리지 않음
      });
      
      setShowCheckoutDialog(false);
      toast({
        title: '체크아웃을 완료했어요',
        description: '다음에 또 만나요!',
      });
    } catch (error) {
      console.error('Failed to check out:', error);
      setActionError('체크아웃 처리에 실패했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
      toast({
        title: '체크아웃이 잘 안 됐어요',
        description: '잠시 후 다시 시도해 주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <GuestMotionCard>
        <Card variant="cta">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-brand-dark">
              <CardIconBadge icon={CheckCircle2} tone="success" />
              체크인/체크아웃
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {!isCheckedIn ? (
            <Button 
              onClick={handleCheckIn} 
              disabled={isProcessing || !token}
              className="w-full"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {isProcessing ? '처리 중...' : '체크인 완료하기'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-background-muted p-4 border border-border">
                <CardIconBadge icon={CheckCircle2} tone="success" size="sm" strokeWidth={2} />
                <div>
                  <p className="text-sm font-semibold text-foreground">체크인 완료</p>
                  <p className="text-xs text-muted-foreground">즐거운 시간 보내세요!</p>
                </div>
              </div>
              {!isCheckedOut && (
                <Button
                  onClick={() => setShowCheckoutDialog(true)}
                  variant="outline"
                  disabled={isProcessing || !token}
                  className="w-full"
                  size="lg"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  체크아웃하기
                </Button>
              )}
            </div>
          )}

          {actionError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-800">처리에 실패했어요</p>
              <p className="mt-1 text-xs text-red-700">{actionError}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3 h-8"
                disabled={isProcessing}
                onClick={() => {
                  if (!isCheckedIn) return void handleCheckIn();
                  if (!isCheckedOut) return void handleCheckout();
                }}
              >
                다시 시도
              </Button>
            </div>
          ) : null}

          {lastSyncedAt ? (
            <p className="text-[11px] text-muted-foreground">
              마지막 동기화: {lastSyncedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          ) : null}
          </CardContent>
        </Card>
      </GuestMotionCard>

      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-brand-dark">체크아웃 확인</DialogTitle>
            <DialogDescription className="text-brand-dark-muted">
              체크아웃 전 다음 사항을 확인해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="rounded-xl border bg-background-muted/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-brand-dark">체크리스트 진행률</p>
                <p className="text-xs text-muted-foreground">
                  {checklistDone}/{checklistTotal} 완료
                </p>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${checklistPercent}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>

            <label
              className={`flex items-center gap-3 rounded-xl p-4 cursor-pointer transition-colors border ${
                checklist.gasLocked
                  ? 'bg-background-muted border-border/60 hover:bg-background-accent'
                  : 'bg-red-50/50 border-red-200 hover:bg-red-50'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.gasLocked}
                onChange={(e) =>
                  setChecklist({ ...checklist, gasLocked: e.target.checked })
                }
                className="h-5 w-5 rounded-lg border-brand-cream-dark accent-brand-dark"
              />
              <span className="text-brand-dark font-medium">가스 레버 잠금 확인</span>
            </label>
            <label
              className={`flex items-center gap-3 rounded-xl p-4 cursor-pointer transition-colors border ${
                checklist.trashCleaned
                  ? 'bg-background-muted border-border/60 hover:bg-background-accent'
                  : 'bg-red-50/50 border-red-200 hover:bg-red-50'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.trashCleaned}
                onChange={(e) =>
                  setChecklist({ ...checklist, trashCleaned: e.target.checked })
                }
                className="h-5 w-5 rounded-lg border-brand-cream-dark accent-brand-dark"
              />
              <span className="text-brand-dark font-medium">쓰레기 정리 확인</span>
            </label>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCheckoutDialog(false)}
            >
              취소
            </Button>
            <Button 
              onClick={handleCheckout}
              disabled={isProcessing || !isChecklistComplete}
            >
              {isProcessing ? '처리 중...' : isChecklistComplete ? '체크아웃 완료하기' : '체크리스트 확인 필요'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
