'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useGuestStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { checkOut as apiCheckOut, sendCheckOutToN8N } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CheckoutStatusCardProps {
  token: string;
}

export function CheckoutStatusCard({ token }: CheckoutStatusCardProps) {
  const { checkOut, guestInfo } = useGuestStore();
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleCheckout = async () => {
    if (!isChecklistComplete) return;

    setIsProcessing(true);
    
    try {
      await apiCheckOut(token, checklist);
      checkOut();
      
      sendCheckOutToN8N({
        guest: guestInfo.name,
        room: guestInfo.room,
        checkoutTime: new Date().toISOString(),
        checklist,
      }).catch(() => {});
      
      setShowCheckoutDialog(false);
      toast({
        title: '체크아웃을 완료했어요',
        description: '다음에 또 만나요!',
      });
    } catch {
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
      <GuestMotionCard motionMode="spring">
        <Card variant="info" className="card-hover-glow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-brand-dark">
              <CardIconBadge icon={CheckCircle2} tone="success" />
              체크인 완료
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-status-success/5 p-4 border border-status-success/10">
              <CheckCircle2 className="h-5 w-5 text-status-success shrink-0" />
              <div>
                <p className="text-sm font-semibold text-brand-dark">체크인 완료</p>
                <p className="text-xs text-muted-foreground">즐거운 시간 보내세요!</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowCheckoutDialog(true)}
              variant="outline"
              className="w-full group"
              size="lg"
            >
              <XCircle className="mr-2 h-5 w-5" />
              체크아웃하기
              <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
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
