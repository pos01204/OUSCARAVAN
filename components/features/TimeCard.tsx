'use client';

import { Clock, LogIn, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardInset, CardLabelValue } from '@/components/ui/card';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { CHECK_IN_OUT } from '@/lib/constants';

export function TimeCard() {
  return (
    <GuestMotionCard motionMode="spring">
      <Card variant="info" className="card-hover-glow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-brand-dark">
            <CardIconBadge icon={Clock} tone="info" />
            이용 시간 안내
          </CardTitle>
          <div className="mt-1.5 h-0.5 w-6 rounded-full bg-status-info/30" aria-hidden="true" />
        </CardHeader>
        <CardContent className="space-y-3">
          <CardInset className="flex items-center gap-4">
            <CardIconBadge icon={LogIn} tone="info" size="sm" strokeWidth={2} />
            <CardLabelValue 
              label="체크인" 
              value={CHECK_IN_OUT.checkIn} 
              valueSize="lg"
            />
          </CardInset>
          <CardInset className="flex items-center gap-4">
            <CardIconBadge icon={LogOut} tone="info" size="sm" strokeWidth={2} />
            <CardLabelValue 
              label="체크아웃" 
              value={CHECK_IN_OUT.checkOut} 
              valueSize="lg"
            />
          </CardInset>
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground leading-relaxed">
              객실 준비로 인해 조기 체크인은 불가합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </GuestMotionCard>
  );
}
