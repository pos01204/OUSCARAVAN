'use client';

import { Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

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
    <Card variant="info">
      <CardContent className="p-6">
        <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CardIconBadge icon={Calendar} tone="info" size="sm" />
            <h2 className="text-xl font-bold text-foreground">체크인 안내</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CardIconBadge icon={Clock} tone="info" size="sm" />
              <div>
                <p className="text-sm text-muted-foreground">체크인 시간</p>
                <p className="text-2xl font-bold text-foreground">오후 3시 (15:00)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CardIconBadge icon={Clock} tone="info" size="sm" />
              <div>
                <p className="text-sm text-muted-foreground">체크아웃 시간</p>
                <p className="text-2xl font-bold text-foreground">오전 11시 (11:00)</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-sm text-foreground leading-relaxed">
                조기 체크인은 불가능합니다. (객실 준비 시간이 필요합니다)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                체크인 시간 전 도착 시 관리자에게 연락하여 안내받아주세요.
              </p>
            </div>
          </div>

          {token && (
            <Button
              onClick={handleNavigateToCheckInOut}
              variant="default"
              className="w-full mt-4"
              aria-label="체크인/체크아웃 페이지로 이동"
            >
              체크인/체크아웃 페이지로 이동
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
