'use client';

import { Wifi, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardInset, CardLabelValue } from '@/components/ui/card';
import { WIFI_INFO } from '@/lib/constants';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { CardIconBadge } from '@/components/shared/CardIconBadge';

/**
 * WiFi 연결 안내 카드
 * 비밀번호 없이 자동 연결되는 WiFi 안내
 */
export function WifiCard() {
  return (
    <GuestMotionCard motionMode="spring">
      <Card variant="info" className="overflow-hidden card-hover-glow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-brand-dark">
            <CardIconBadge icon={Wifi} tone="info" />
            WiFi 연결
          </CardTitle>
          <div className="mt-1.5 h-0.5 w-6 rounded-full bg-status-info/30" aria-hidden="true" />
        </CardHeader>
        <CardContent className="space-y-4">
          <CardInset>
            <div className="flex items-center justify-between">
              <CardLabelValue label="네트워크" value={WIFI_INFO.ssid} />
              <div className="flex items-center gap-1.5 text-status-success">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-medium">비밀번호 없음</span>
              </div>
            </div>
          </CardInset>
          
          {/* 연결 안내 */}
          <div className="flex items-start gap-2 rounded-lg bg-status-info/5 p-3 border border-status-info/10">
            <Wifi className="h-4 w-4 text-status-info mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              카라반 내에서 WiFi를 검색하면 자동으로 연결됩니다. 
              비밀번호 없이 아무 네트워크나 선택해서 사용하세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </GuestMotionCard>
  );
}
