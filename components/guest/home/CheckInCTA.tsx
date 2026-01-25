'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { CheckCircle2, Clock, LogIn, LogOut } from 'lucide-react';
import { CHECK_IN_OUT } from '@/lib/constants';
import { useGuestStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { checkIn as apiCheckIn, sendCheckInToN8N } from '@/lib/api';

interface CheckInCTAProps {
  token: string;
}

export function CheckInCTA({ token }: CheckInCTAProps) {
  const { checkIn, guestInfo } = useGuestStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleCheckIn = async () => {
    setIsProcessing(true);
    
    try {
      await apiCheckIn(token);
      checkIn();
      
      sendCheckInToN8N({
        guest: guestInfo.name,
        room: guestInfo.room,
        checkinTime: new Date().toISOString(),
        source: 'web_app',
      }).catch(() => {});
      
      toast({
        title: '체크인이 완료됐어요',
        description: '즐거운 시간 보내세요!',
      });
    } catch {
      toast({
        title: '체크인이 잘 안 됐어요',
        description: '네트워크 상태를 확인한 뒤 다시 시도해 주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <GuestMotionCard motionMode="spring">
      <Card variant="cta" className="card-hover-glow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-brand-dark">
            <CardIconBadge icon={CheckCircle2} tone="success" />
            체크인
          </CardTitle>
          <div className="mt-1.5 h-0.5 w-6 rounded-full bg-status-success/30" aria-hidden="true" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 체크인/아웃 시간 안내 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-background-muted p-3 border border-border/50">
              <CardIconBadge icon={LogIn} tone="info" size="sm" />
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">체크인</p>
                <p className="text-base font-bold text-brand-dark">{CHECK_IN_OUT.checkIn}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-background-muted p-3 border border-border/50">
              <CardIconBadge icon={LogOut} tone="info" size="sm" />
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">체크아웃</p>
                <p className="text-base font-bold text-brand-dark">{CHECK_IN_OUT.checkOut}</p>
              </div>
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="flex items-start gap-2 rounded-lg bg-status-info/5 p-3 border border-status-info/10">
            <Clock className="h-4 w-4 text-status-info mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              체크인 시간(15:00) 이후 도착하시면 버튼을 눌러 체크인을 완료해주세요.
            </p>
          </div>

          {/* 체크인 버튼 */}
          <Button 
            onClick={handleCheckIn} 
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {isProcessing ? '처리 중...' : '체크인 완료하기'}
          </Button>
        </CardContent>
      </Card>
    </GuestMotionCard>
  );
}
