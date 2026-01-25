'use client';

import { useEffect, useMemo } from 'react';
import { useGuestStore } from '@/lib/store';
import { HeroSection } from './HeroSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { CheckCircle2, Star, Calendar, ShoppingBag, ChevronRight } from 'lucide-react';
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
    <main className="space-y-5" role="main" aria-label="고객 홈 페이지">
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
          <CardContent className="py-8 px-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-status-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-7 w-7 text-status-success" />
            </div>
            <h2 className="text-lg font-bold text-brand-dark">체크아웃이 완료되었어요</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              즐거운 시간이 되셨기를 바랍니다.<br />
              다음에 또 찾아주세요!
            </p>
            
            {/* 후기 남기기 버튼 - 개선된 디자인 */}
            <div className="mt-6">
              <Button 
                asChild
                className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-0 font-semibold px-6"
              >
                <a 
                  href="https://naver.me/ouscaravan-review" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Star className="h-4 w-4 fill-current" />
                  후기 남기기
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </GuestMotionCard>

      <SectionDivider variant="brand" />

      {/* 이번 방문 요약 */}
      <GuestMotionCard motionMode="spring">
        <Card variant="muted">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-brand-dark text-base">
              <CardIconBadge icon={Calendar} tone="info" size="sm" />
              이번 방문 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
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

      {/* SNS 안내 - 카드 형태로 개선 */}
      <GuestMotionCard motionMode="spring">
        <Card variant="muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-brand-dark text-base">
              오우스카라반 SNS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {/* 인스타그램 */}
            <a 
              href="https://www.instagram.com/ouscaravan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-background-elevated border border-border/50 hover:border-border hover:bg-background-accent transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-dark text-sm">인스타그램</p>
                <p className="text-xs text-muted-foreground">@ouscaravan</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>
            
            {/* 네이버 블로그 */}
            <a 
              href="https://blog.naver.com/ouscaravan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-background-elevated border border-border/50 hover:border-border hover:bg-background-accent transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#03C75A] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-dark text-sm">네이버 블로그</p>
                <p className="text-xs text-muted-foreground">최신 소식 확인</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>
          </CardContent>
        </Card>
      </GuestMotionCard>
    </main>
  );
}
