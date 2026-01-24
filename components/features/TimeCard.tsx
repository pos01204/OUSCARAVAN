'use client';

import { Clock, LogIn, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { CHECK_IN_OUT } from '@/lib/constants';

export function TimeCard() {
  return (
    <GuestMotionCard>
      <Card variant="info">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-brand-dark">
          <CardIconBadge icon={Clock} tone="brand" />
          이용 시간 안내
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 rounded-xl bg-background-muted p-4 border border-border">
          <CardIconBadge icon={LogIn} tone="success" size="sm" strokeWidth={2} />
          <div>
            <p className="text-xs text-muted-foreground font-medium">체크인</p>
            <p className="text-xl font-bold text-foreground">{CHECK_IN_OUT.checkIn}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-background-muted p-4 border border-border">
          <CardIconBadge icon={LogOut} tone="info" size="sm" strokeWidth={2} />
          <div>
            <p className="text-xs text-muted-foreground font-medium">체크아웃</p>
            <p className="text-xl font-bold text-foreground">{CHECK_IN_OUT.checkOut}</p>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            객실 준비로 인해 조기 체크인은 불가합니다.
          </p>
        </div>
      </CardContent>
      </Card>
    </GuestMotionCard>
  );
}
