'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CHECK_IN_OUT } from '@/lib/constants';
import { useGuestStore } from '@/lib/store';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetTime: string): TimeLeft | null {
  const [hours, minutes] = targetTime.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  
  // 오늘 시간이 지났다면 내일로 설정
  if (target < now) {
    target.setDate(target.getDate() + 1);
  }
  
  const diff = target.getTime() - now.getTime();
  
  if (diff <= 0) {
    return null;
  }
  
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function TimeCountdown() {
  const { isCheckedIn, isCheckedOut, guestInfo } = useGuestStore();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // 체크인 후에는 카운트다운을 표시하지 않음 (체크아웃 카운트다운 제거)
    if (isCheckedIn || isCheckedOut) {
      setTimeLeft(null);
      return;
    }

    // 체크인 전에만 체크인 카운트다운 표시
    const target = CHECK_IN_OUT.checkIn;
    
    const updateTime = () => {
      const calculated = calculateTimeLeft(target);
      setTimeLeft(calculated);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [isCheckedIn, isCheckedOut]);

  if (!timeLeft) {
    return null;
  }

  const label = '체크인까지';
  const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 60;

  return (
    <Card className={isUrgent ? 'border-destructive/50 bg-destructive/5' : ''}>
      <CardContent className="flex items-center gap-3 p-4">
        <Clock className={`h-5 w-5 ${isUrgent ? 'text-destructive' : 'text-primary'}`} />
        <div className="flex-1">
          <p className="text-sm font-medium">{label}</p>
          <p className={`text-lg font-semibold ${isUrgent ? 'text-destructive' : ''}`}>
            {timeLeft.hours > 0 && `${timeLeft.hours}시간 `}
            {timeLeft.minutes}분 {timeLeft.seconds}초
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
