'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGuestStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function CheckInOut() {
  const { isCheckedIn, isCheckedOut, checkIn, checkOut, guestInfo } =
    useGuestStore();
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [checklist, setChecklist] = useState({
    gasLocked: false,
    trashCleaned: false,
  });
  const { toast } = useToast();

  const handleCheckIn = () => {
    checkIn();
    toast({
      title: '체크인 완료',
      description: '체크인이 완료되었습니다. 즐거운 시간 보내세요!',
    });
    // 향후: n8n 웹훅으로 전송
  };

  const handleCheckout = () => {
    if (!checklist.gasLocked || !checklist.trashCleaned) {
      toast({
        title: '확인 필요',
        description: '모든 체크리스트를 확인해주세요.',
        variant: 'destructive',
      });
      return;
    }
    checkOut();
    setShowCheckoutDialog(false);
    toast({
      title: '체크아웃 완료',
      description: '체크아웃이 완료되었습니다. 다음에 또 만나요!',
    });
    // 향후: n8n 웹훅으로 전송
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>체크인/체크아웃</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCheckedIn ? (
            <Button onClick={handleCheckIn} className="w-full">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              체크인하기
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                체크인 완료
              </div>
              {!isCheckedOut && (
                <Button
                  onClick={() => setShowCheckoutDialog(true)}
                  variant="outline"
                  className="w-full"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  체크아웃하기
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>체크아웃 확인</DialogTitle>
            <DialogDescription>
              체크아웃 전 다음 사항을 확인해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={checklist.gasLocked}
                onChange={(e) =>
                  setChecklist({ ...checklist, gasLocked: e.target.checked })
                }
                className="h-4 w-4 rounded border-border"
              />
              <span>가스 레버 잠금 확인</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={checklist.trashCleaned}
                onChange={(e) =>
                  setChecklist({ ...checklist, trashCleaned: e.target.checked })
                }
                className="h-4 w-4 rounded border-border"
              />
              <span>쓰레기 정리 확인</span>
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCheckoutDialog(false)}
            >
              취소
            </Button>
            <Button onClick={handleCheckout}>체크아웃 완료</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
