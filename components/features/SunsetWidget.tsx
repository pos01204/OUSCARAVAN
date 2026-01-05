'use client';

import { useState, useEffect } from 'react';
import { Sunset } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getTodaySunset } from '@/lib/sunset';

export function SunsetWidget() {
  const [sunsetTime, setSunsetTime] = useState<string>('--:--');

  useEffect(() => {
    // 클라이언트에서만 계산 (SSR 방지)
    setSunsetTime(getTodaySunset());
  }, []);

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <Sunset className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">오늘의 일몰</p>
          <p className="text-lg font-semibold">{sunsetTime}</p>
        </div>
      </CardContent>
    </Card>
  );
}
