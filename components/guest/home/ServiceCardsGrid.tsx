'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardInset, CardLabelValue } from '@/components/ui/card';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { Wifi, Clock, LogIn, LogOut } from 'lucide-react';
import { CHECK_IN_OUT, WIFI_INFO } from '@/lib/constants';
import { CARD_STAGGER } from '@/lib/motion';

export function ServiceCardsGrid() {
  return (
    <motion.section 
      className="grid grid-cols-1 md:grid-cols-2 gap-4" 
      aria-label="서비스 정보"
      variants={CARD_STAGGER.container}
      initial="hidden"
      animate="show"
    >
      {/* WiFi 카드 (간소화) */}
      <motion.div variants={CARD_STAGGER.item}>
        <GuestMotionCard motionMode="spring">
          <Card variant="info" className="card-hover-glow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-brand-dark">
                <CardIconBadge icon={Wifi} tone="info" />
                WiFi 연결
              </CardTitle>
              <div className="mt-1.5 h-0.5 w-6 rounded-full bg-status-info/30" aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-3">
              <CardInset>
                <CardLabelValue label="네트워크" value={WIFI_INFO.ssid} />
              </CardInset>
              <div className="flex items-start gap-2 rounded-lg bg-status-info/5 p-3 border border-status-info/10">
                <Wifi className="h-4 w-4 text-status-info mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  비밀번호 없이 자동 연결됩니다. 카라반 내에서 WiFi를 검색해 연결해주세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </GuestMotionCard>
      </motion.div>

      {/* 이용시간 카드 */}
      <motion.div variants={CARD_STAGGER.item}>
        <GuestMotionCard motionMode="spring">
          <Card variant="info" className="card-hover-glow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-brand-dark">
                <CardIconBadge icon={Clock} tone="info" />
                이용 시간
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
            </CardContent>
          </Card>
        </GuestMotionCard>
      </motion.div>
    </motion.section>
  );
}
