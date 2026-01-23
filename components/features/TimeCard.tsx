'use client';

import { Clock, LogIn, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHECK_IN_OUT } from '@/lib/constants';

export function TimeCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-brand-dark">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Clock className="h-4 w-4" strokeWidth={2.5} />
          </div>
          이용 시간 안내
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 rounded-xl bg-green-50 p-4">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
            <LogIn className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs text-green-700 font-medium">체크인</p>
            <p className="text-xl font-bold text-green-800">{CHECK_IN_OUT.checkIn}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-blue-50 p-4">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <LogOut className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs text-blue-700 font-medium">체크아웃</p>
            <p className="text-xl font-bold text-blue-800">{CHECK_IN_OUT.checkOut}</p>
          </div>
        </div>
        <div className="pt-2 border-t border-brand-cream-dark/20">
          <p className="text-xs text-brand-dark-muted leading-relaxed">
            객실 준비로 인해 조기 체크인은 불가합니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
