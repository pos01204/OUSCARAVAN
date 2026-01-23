'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGuestStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { checkIn as apiCheckIn, checkOut as apiCheckOut, sendCheckInToN8N, sendCheckOutToN8N } from '@/lib/api';
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
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checklist, setChecklist] = useState({
    gasLocked: false,
    trashCleaned: false,
  });
  const { toast } = useToast();

  const handleCheckIn = async () => {
    if (!token) {
      toast({
        title: '오류',
        description: '토큰이 필요합니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
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
        title: '체크인 완료',
        description: '체크인이 완료되었습니다. 즐거운 시간 보내세요!',
      });
    } catch (error) {
      console.error('Failed to check in:', error);
      toast({
        title: '체크인 실패',
        description: '체크인 처리에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (!token) {
      toast({
        title: '오류',
        description: '토큰이 필요합니다.',
        variant: 'destructive',
      });
      return;
    }

    if (!checklist.gasLocked || !checklist.trashCleaned) {
      toast({
        title: '확인 필요',
        description: '모든 체크리스트를 확인해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
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
        title: '체크아웃 완료',
        description: '체크아웃이 완료되었습니다. 다음에 또 만나요!',
      });
    } catch (error) {
      console.error('Failed to check out:', error);
      toast({
        title: '체크아웃 실패',
        description: '체크아웃 처리에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-brand-dark">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
            </div>
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
              <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">체크인 완료</p>
                  <p className="text-xs text-green-600">즐거운 시간 보내세요!</p>
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
        </CardContent>
      </Card>

      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-brand-dark">체크아웃 확인</DialogTitle>
            <DialogDescription className="text-brand-dark-muted">
              체크아웃 전 다음 사항을 확인해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <label className="flex items-center gap-3 rounded-xl bg-background-muted p-4 cursor-pointer hover:bg-background-accent transition-colors">
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
            <label className="flex items-center gap-3 rounded-xl bg-background-muted p-4 cursor-pointer hover:bg-background-accent transition-colors">
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
              disabled={isProcessing}
            >
              {isProcessing ? '처리 중...' : '체크아웃 완료하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
