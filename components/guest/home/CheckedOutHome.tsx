'use client';

import { useEffect, useMemo } from 'react';
import { useGuestStore } from '@/lib/store';
import { HeroSection } from './HeroSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { CheckCircle2, Star, Instagram, ExternalLink, Calendar, ShoppingBag } from 'lucide-react';
import { SectionDivider } from '@/components/shared/SectionDivider';
import { useGuestOrders } from '@/lib/hooks/useGuestOrders';
import { getGuestHeroPreset } from '@/lib/guest-hero-preset';
import { daysBetween } from '@/lib/utils/date';
import type { Reservation } from '@/lib/api';

interface CheckedOutHomeProps {
  reservation: Reservation;
  token: string;
}

export function CheckedOutHome({ reservation, token }: CheckedOutHomeProps) {
  const { setGuestInfo, isCheckedIn, isCheckedOut, checkIn, checkOut } = useGuestStore();
  const { orders } = useGuestOrders(token);
  const heroPreset = getGuestHeroPreset(reservation.status);

  useEffect(() => {
    setGuestInfo({
      name: reservation.guestName,
      room: reservation.assignedRoom || '',
      checkinDate: reservation.checkin,
      checkoutDate: reservation.checkout,
    });

    // 서버 상태와 동기화
    if (!isCheckedIn) checkIn();
    if (!isCheckedOut) checkOut();
  }, [reservation, setGuestInfo, isCheckedIn, isCheckedOut, checkIn, checkOut]);

  // 방문 요약 계산
  const stayDays = useMemo(() => {
    const days = daysBetween(reservation.checkin, reservation.checkout);
    return days !== null ? days : 0;
  }, [reservation.checkin, reservation.checkout]);

  const bbqFireOrders = useMemo(() => {
    return orders.filter((o) => o.type === 'bbq' || o.type === 'fire');
  }, [orders]);

  const totalSpent = useMemo(() => {
    return bbqFireOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [bbqFireOrders]);

  return (
    <main className="space-y-6" role="main" aria-label="고객 홈 페이지">
      {/* Hero Section */}
      <HeroSection
        guestName={reservation.guestName}
        checkin={reservation.checkin}
        checkout={reservation.checkout}
        eyebrow={heroPreset.eyebrow}
        subtitle={heroPreset.subtitle}
        waveLineClass={heroPreset.waveLineClass}
      />

      {/* 체크아웃 완료 카드 */}
      <GuestMotionCard motionMode="spring">
        <Card variant="info" className="card-hover-glow">
          <CardContent className="p-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-status-success" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-dark">체크아웃이 완료되었어요</h2>
              <p className="text-sm text-muted-foreground mt-1">
                즐거운 시간이 되셨기를 바랍니다.<br />
                다음에 또 찾아주세요!
              </p>
            </div>
            <Button variant="outline" className="group" asChild>
              <a 
                href="https://naver.me/ouscaravan-review" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Star className="mr-2 h-4 w-4 text-yellow-500" />
                후기 남기기
                <ExternalLink className="ml-2 h-3 w-3 opacity-50 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </GuestMotionCard>

      <SectionDivider variant="brand" />

      {/* 이번 방문 요약 */}
      <GuestMotionCard motionMode="spring">
        <Card variant="muted">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-brand-dark text-base">
              <CardIconBadge icon={Calendar} tone="info" size="sm" />
              이번 방문 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-background-elevated p-4 border border-border/50 text-center">
                <p className="text-2xl font-bold text-brand-dark">{stayDays}박</p>
                <p className="text-xs text-muted-foreground mt-1">체류 기간</p>
              </div>
              <div className="rounded-xl bg-background-elevated p-4 border border-border/50 text-center">
                <p className="text-2xl font-bold text-brand-dark">{bbqFireOrders.length}회</p>
                <p className="text-xs text-muted-foreground mt-1">서비스 이용</p>
              </div>
            </div>
            {totalSpent > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-background-elevated p-4 border border-border/50">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">총 이용 금액</span>
                </div>
                <span className="text-base font-bold text-brand-dark">
                  {totalSpent.toLocaleString()}원
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </GuestMotionCard>

      <SectionDivider variant="minimal" />

      {/* SNS 안내 */}
      <GuestMotionCard motionMode="spring">
        <Card variant="muted">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-brand-dark text-base">
              오우스카라반 SNS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start group" asChild>
              <a 
                href="https://www.instagram.com/ouscaravan" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Instagram className="mr-3 h-5 w-5 text-pink-500" />
                인스타그램
                <ExternalLink className="ml-auto h-3 w-3 opacity-50 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start group" asChild>
              <a 
                href="https://blog.naver.com/ouscaravan" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <span className="mr-3 text-green-600 font-bold text-sm">N</span>
                네이버 블로그
                <ExternalLink className="ml-auto h-3 w-3 opacity-50 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </GuestMotionCard>
    </main>
  );
}
