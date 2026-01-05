'use client';

import { Clock, LogIn, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHECK_IN_OUT } from '@/lib/constants';

export function TimeCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          체크인/체크아웃
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <LogIn className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">체크인</p>
              <p className="text-lg font-semibold">{CHECK_IN_OUT.checkIn}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">체크아웃</p>
              <p className="text-lg font-semibold">{CHECK_IN_OUT.checkOut}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
