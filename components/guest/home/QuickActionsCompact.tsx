'use client';

import Link from 'next/link';
import { Wifi, Flame, BookOpen, HelpCircle, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { CardIconBadge } from '@/components/shared/CardIconBadge';

interface QuickActionsCompactProps {
  token: string;
  variant: 'pre_checkin' | 'checked_in';
}

interface ActionItem {
  key: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
}

export function QuickActionsCompact({ token, variant }: QuickActionsCompactProps) {
  const base = `/guest/${token}`;

  // 체크인 전: WiFi가 첫 번째
  const preCheckinActions: ActionItem[] = [
    { key: 'wifi', title: 'WiFi 연결', desc: '자동 연결', icon: Wifi, href: `${base}#wifi` },
    { key: 'order', title: '불멍/BBQ', desc: '세트 주문', icon: Flame, href: `${base}/order` },
    { key: 'guide', title: '이용 안내', desc: '시설 가이드', icon: BookOpen, href: `${base}/guide` },
    { key: 'help', title: '도움말', desc: '응급·FAQ', icon: HelpCircle, href: `${base}/help` },
  ];

  // 체크인 후: 주문이 첫 번째
  const checkedInActions: ActionItem[] = [
    { key: 'order', title: '불멍/BBQ', desc: '세트 주문', icon: Flame, href: `${base}/order` },
    { key: 'wifi', title: 'WiFi 연결', desc: '자동 연결', icon: Wifi, href: `${base}#wifi` },
    { key: 'guide', title: '이용 안내', desc: '시설 가이드', icon: BookOpen, href: `${base}/guide` },
    { key: 'help', title: '도움말', desc: '응급·FAQ', icon: HelpCircle, href: `${base}/help` },
  ];

  const actions = variant === 'checked_in' ? checkedInActions : preCheckinActions;

  return (
    <section aria-label="빠른 실행" className="grid grid-cols-2 gap-3">
      {actions.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.key} href={item.href} className="block group focus-visible:outline-none">
            <GuestMotionCard className="h-full" motionMode="lift">
              <Card
                interactive
                variant="cta"
                className="h-full p-4 rounded-xl card-hover-glow"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 transition-transform duration-200 group-hover:scale-105">
                    <CardIconBadge icon={Icon} tone="info" size="md" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight text-brand-dark">{item.title}</p>
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
