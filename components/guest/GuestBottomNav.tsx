'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, ShoppingBag, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuestBottomNavProps {
  token: string;
}

export function GuestBottomNav({ token }: GuestBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: `/guest/${token}`, label: '홈', icon: Home },
    { href: `/guest/${token}/guide`, label: '안내', icon: BookOpen },
    { href: `/guest/${token}/order`, label: '주문/카페 이용', icon: ShoppingBag },
    { href: `/guest/${token}/help`, label: '도움말', icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href === `/guest/${token}` && pathname === `/guest/${token}`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 px-3 py-1 transition-all active:scale-90',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn("h-6 w-6 transition-transform", isActive && "scale-110")} aria-hidden="true" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
