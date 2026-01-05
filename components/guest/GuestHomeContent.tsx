'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGuestStore } from '@/lib/store';
import { WifiCard } from '@/components/features/WifiCard';
import { TimeCard } from '@/components/features/TimeCard';
import { SunsetWidget } from '@/components/features/SunsetWidget';
import { CheckInOut } from '@/components/features/CheckInOut';
import { OrderHistory } from '@/components/features/OrderHistory';
import { CheckoutReminder } from '@/components/features/CheckoutReminder';
import { TimeCountdown } from '@/components/features/TimeCountdown';
import { WELCOME_MESSAGE } from '@/lib/constants';
import type { Reservation } from '@/lib/api';

interface GuestHomeContentProps {
  reservation: Reservation;
  token: string;
}

export function GuestHomeContent({ reservation, token }: GuestHomeContentProps) {
  const { setGuestInfo, isCheckedIn } = useGuestStore();
  
  useEffect(() => {
    // Railway API에서 가져온 예약 정보로 게스트 정보 설정
    setGuestInfo({
      name: reservation.guestName,
      room: reservation.assignedRoom || '',
      checkinDate: reservation.checkin,
      checkoutDate: reservation.checkout,
    });
    
    // 자동 체크인 (체크인 날짜가 오늘인 경우)
    if (reservation.checkin && !isCheckedIn) {
      const today = new Date().toISOString().split('T')[0];
      if (reservation.checkin.startsWith(today)) {
        useGuestStore.getState().checkIn();
      }
    }
  }, [reservation, setGuestInfo, isCheckedIn]);
  
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
          {WELCOME_MESSAGE.korean.replace('{name}', reservation.guestName)}
        </h1>
        {reservation.assignedRoom && (
          <p className="mt-2 text-muted-foreground">객실: {reservation.assignedRoom}</p>
        )}
      </motion.div>
      
      {/* Checkout Reminder */}
      <CheckoutReminder />
      
      {/* Time Countdown */}
      <TimeCountdown />
      
      {/* Status Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <WifiCard />
        <TimeCard />
        <SunsetWidget />
        <CheckInOut />
      </div>
      
      {/* Order History */}
      <OrderHistory />
    </div>
  );
}
