'use client';

import Link from 'next/link';
import { Wifi, LogIn, Flame, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface QuickActionGridProps {
  token: string;
}

export function QuickActionGrid({ token }: QuickActionGridProps) {
  const base = `/guest/${token}`;

  const items = [
    {
      key: 'checkinout',
      title: '체크인/아웃하기',
      desc: '체크인/체크아웃',
      icon: LogIn,
      href: `${base}/checkinout`,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      key: 'wifi',
      title: 'WiFi 연결하기',
      desc: '비밀번호/QR',
      icon: Wifi,
      href: `${base}#wifi`,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      key: 'order',
      title: '불멍/바베큐',
      desc: '세트 주문하기',
      icon: Flame,
      href: `${base}/order`,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      key: 'help',
      title: '도움말',
      desc: '응급/FAQ',
      icon: HelpCircle,
      href: `${base}/help`,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <section aria-label="빠른 실행" className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.key} href={item.href} className="block group">
            <Card 
              interactive
              variant="cta"
              className="h-full p-4 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor} transition-transform group-hover:scale-105`}>
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm md:text-base leading-tight text-brand-dark">{item.title}</p>
                  <p className="text-xs text-brand-dark-muted mt-1">{item.desc}</p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </section>
  );
}

