'use client';

import { Sunset } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SUNSET_TIME } from '@/lib/constants';

export function SunsetWidget() {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <Sunset className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">오늘의 일몰</p>
          <p className="text-lg font-semibold">{SUNSET_TIME.today}</p>
        </div>
      </CardContent>
    </Card>
  );
}
