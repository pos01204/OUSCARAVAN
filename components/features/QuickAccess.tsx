'use client';

import { Wifi, Thermometer, Flame, LogOut, Home, Coffee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface QuickAccessItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
}

interface QuickAccessProps {
  token?: string;
  items?: QuickAccessItem[];
}

const defaultItems = (token?: string): QuickAccessItem[] => [
  {
    id: 'wifi',
    label: 'WiFi 연결',
    icon: Wifi,
    href: token ? `/guest/${token}/guide#wifi` : '/guide#wifi',
  },
  {
    id: 'heating',
    label: '난방/에어컨',
    icon: Thermometer,
    href: token ? `/guest/${token}/guide#heating` : '/guide#heating',
  },
  {
    id: 'bbq',
    label: 'BBQ 가이드',
    icon: Flame,
    href: token ? `/guest/${token}/guide#bbq` : '/guide#bbq',
  },
  {
    id: 'checkout',
    label: '체크아웃',
    icon: LogOut,
    href: token ? `/guest/${token}/checkinout` : '/checkinout',
  },
];

export function QuickAccess({ token, items }: QuickAccessProps) {
  const router = useRouter();
  const displayItems = items || defaultItems(token);

  const handleClick = (item: QuickAccessItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      if (item.href.startsWith('#')) {
        // 같은 페이지 내 앵커 링크
        const element = document.querySelector(item.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        router.push(item.href);
      }
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">빠른 접근</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {displayItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="outline"
                className="flex flex-col items-center justify-center gap-2 h-20 p-2 hover:bg-primary/10 hover:border-primary/50 transition-all"
                onClick={() => handleClick(item)}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
