'use client';

import Link from 'next/link';
import { Wifi, LogIn, ShoppingBag, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface QuickActionGridProps {
  token: string;
}

export function QuickActionGrid({ token }: QuickActionGridProps) {
  const base = `/guest/${token}`;

  const items = [
    {
      key: 'wifi',
      title: 'WiFi 연결',
      desc: '비밀번호/QR',
      icon: Wifi,
      href: `${base}#wifi`,
    },
    {
      key: 'checkinout',
      title: '체크인/아웃',
      desc: '상태 확인',
      icon: LogIn,
      href: `${base}/checkinout`,
    },
    {
      key: 'order',
      title: '주문하기',
      desc: '불멍/키오스크',
      icon: ShoppingBag,
      href: `${base}/order`,
    },
    {
      key: 'help',
      title: '도움말',
      desc: '응급/FAQ',
      icon: HelpCircle,
      href: `${base}/help`,
    },
  ];

  return (
    <section aria-label="빠른 실행" className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.key} href={item.href} className="block">
            <Card className="h-full p-4 rounded-xl border-border/60 bg-background/80 hover:bg-background transition-colors active:scale-[0.99]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm md:text-base leading-tight">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </section>
  );
}

