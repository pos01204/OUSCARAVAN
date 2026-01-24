'use client';

import Link from 'next/link';
import { Wifi, LogIn, Flame, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { CardIconBadge } from '@/components/shared/CardIconBadge';

interface QuickActionGridProps {
  token: string;
}

export function QuickActionGrid({ token }: QuickActionGridProps) {
  const base = `/guest/${token}`;

  const items: Array<{
    key: string;
    title: string;
    desc: string;
    icon: typeof LogIn;
    href: string;
    tone: 'info';
  }> = [
    {
      key: 'checkinout',
      title: '체크인/아웃',
      desc: '입실·퇴실',
      icon: LogIn,
      href: `${base}/checkinout`,
      tone: 'info',
    },
    {
      key: 'wifi',
      title: 'WiFi 연결',
      desc: '비밀번호·QR',
      icon: Wifi,
      href: `${base}#wifi`,
      tone: 'info',
    },
    {
      key: 'order',
      title: '불멍/바베큐',
      desc: '세트 주문',
      icon: Flame,
      href: `${base}/order`,
      tone: 'info',
    },
    {
      key: 'help',
      title: '도움말',
      desc: '응급·FAQ',
      icon: HelpCircle,
      href: `${base}/help`,
      tone: 'info',
    },
  ];

  return (
    <section aria-label="빠른 실행" className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.key} href={item.href} className="block group">
            <GuestMotionCard className="h-full">
              <Card
                interactive
                variant="cta"
                className="h-full p-4 rounded-xl"
              >
                <div className="flex items-start gap-3">
                <div className="mt-0.5 transition-transform group-hover:scale-105">
                  <CardIconBadge icon={Icon} tone={item.tone} size="md" />
                </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm md:text-base leading-tight text-brand-dark">{item.title}</p>
                    <p className="text-xs text-brand-dark-muted mt-1">{item.desc}</p>
                  </div>
                </div>
              </Card>
            </GuestMotionCard>
          </Link>
        );
      })}
    </section>
  );
}

