'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGuestStore } from '@/lib/store';
import { WifiCard } from '@/components/features/WifiCard';
import { TimeCard } from '@/components/features/TimeCard';
import { SunsetWidget } from '@/components/features/SunsetWidget';
import { CheckInOut } from '@/components/features/CheckInOut';
import { WELCOME_MESSAGE } from '@/lib/constants';

export default function HomePage() {
  const searchParams = useSearchParams();
  const { guestInfo, setGuestInfo, isCheckedIn } = useGuestStore();

  useEffect(() => {
    // URL 파라미터에서 게스트 정보 추출
    const guest = searchParams.get('guest') || 'Guest';
    const room = searchParams.get('room') || '';
    const checkin = searchParams.get('checkin') || null;
    const checkout = searchParams.get('checkout') || null;

    setGuestInfo({
      name: guest,
      room,
      checkinDate: checkin,
      checkoutDate: checkout,
    });

    // 자동 체크인 (체크인 날짜가 오늘인 경우)
    if (checkin && !isCheckedIn) {
      const today = new Date().toISOString().split('T')[0];
      if (checkin.startsWith(today)) {
        useGuestStore.getState().checkIn();
      }
    }
  }, [searchParams, setGuestInfo, isCheckedIn]);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 p-8 text-center"
      >
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {WELCOME_MESSAGE.korean.replace('{name}', guestInfo.name)}
        </h1>
        {guestInfo.room && (
          <p className="mt-2 text-muted-foreground">객실: {guestInfo.room}</p>
        )}
      </motion.div>

      {/* Status Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <WifiCard />
        <TimeCard />
        <SunsetWidget />
        <CheckInOut />
      </div>
    </div>
  );
}
