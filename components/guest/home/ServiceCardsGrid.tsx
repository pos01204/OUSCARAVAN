'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardInset, CardLabelValue } from '@/components/ui/card';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { Wifi, MapPin, Car, Navigation } from 'lucide-react';
import { CAFE_INFO } from '@/lib/constants';
import { CARD_STAGGER } from '@/lib/motion';

// 네비게이션 URL (네이버 지도)
const NAVER_MAP_URL = `https://map.naver.com/p/search/${encodeURIComponent(CAFE_INFO.address)}`;

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
              <div className="flex items-start gap-2 rounded-lg bg-status-info/5 p-3 border border-status-info/10">
                <Wifi className="h-4 w-4 text-status-info mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  비밀번호 없이 사용 가능합니다. 카라반 내에서 <span className="font-semibold text-brand-dark">가장 강하게 잡히는 WiFi</span>에 연결해주세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </GuestMotionCard>
      </motion.div>

      {/* 주차 안내 카드 */}
      <motion.div variants={CARD_STAGGER.item}>
        <GuestMotionCard motionMode="spring">
          <Card variant="info" className="card-hover-glow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-brand-dark">
                <CardIconBadge icon={MapPin} tone="info" />
                오시는 길
              </CardTitle>
              <div className="mt-1.5 h-0.5 w-6 rounded-full bg-status-info/30" aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-3">
              <CardInset>
                <CardLabelValue 
                  label="주소" 
                  value="강화군 삼산면 삼산북로 149" 
                />
              </CardInset>
              <CardInset className="flex items-center gap-3">
                <CardIconBadge icon={Car} tone="info" size="sm" strokeWidth={2} />
                <p className="text-xs text-muted-foreground">
                  객실 근처에 <span className="font-semibold text-brand-dark">여러 대</span> 주차 가능
                </p>
              </CardInset>
              <a 
                href={NAVER_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-status-info/10 hover:bg-status-info/15 active:scale-[0.98] p-2.5 border border-status-info/20 transition-all"
              >
                <Navigation className="h-4 w-4 text-status-info" />
                <span className="text-sm font-medium text-status-info">네비게이션 열기</span>
              </a>
            </CardContent>
          </Card>
        </GuestMotionCard>
      </motion.div>
    </motion.section>
  );
}
