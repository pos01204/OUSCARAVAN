'use client';

import { Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardInset, CardLabelValue, CardFooter } from '@/components/ui/card';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';

interface CheckInInfoCardProps {
  token?: string;
}

export function CheckInInfoCard({ token }: CheckInInfoCardProps) {
  const router = useRouter();

  const handleNavigateToCheckInOut = () => {
    if (token) {
      router.push(`/guest/${token}/checkinout`);
    }
  };

  return (
    <GuestMotionCard motionMode="spring">
      <Card variant="info" className="card-hover-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CardIconBadge icon={Calendar} tone="info" size="sm" />
            체크인 안내
          </CardTitle>
          <div className="mt-1.5 h-0.5 w-6 rounded-full bg-status-info/30" aria-hidden="true" />
        </CardHeader>

        <CardContent className="space-y-3">
          <CardInset className="flex items-center gap-4">
            <CardIconBadge icon={Clock} tone="info" size="sm" />
            <CardLabelValue 
              label="체크인 시간" 
              value="오후 3시 (15:00)"
              valueSize="lg"
            />
          </CardInset>

          <CardInset className="flex items-center gap-4">
            <CardIconBadge icon={Clock} tone="info" size="sm" />
            <CardLabelValue 
              label="체크아웃 시간" 
              value="오전 11시 (11:00)"
              valueSize="lg"
            />
          </CardInset>

          <div className="pt-2 border-t border-border/50">
            <p className="text-sm text-foreground leading-relaxed">
              조기 체크인은 불가능합니다. (객실 준비 시간이 필요합니다)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              체크인 시간 전 도착 시 관리자에게 연락하여 안내받아주세요.
            </p>
          </div>
        </CardContent>

        {token && (
          <CardFooter bordered>
            <Button
              onClick={handleNavigateToCheckInOut}
              variant="default"
              className="w-full"
              aria-label="체크인/체크아웃 페이지로 이동"
            >
              체크인/체크아웃 페이지로 이동
            </Button>
          </CardFooter>
        )}
      </Card>
    </GuestMotionCard>
  );
}
