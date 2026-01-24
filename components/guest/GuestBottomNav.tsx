'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Flame, Coffee, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuestBottomNavProps {
  token: string;
}

export function GuestBottomNav({ token }: GuestBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: `/guest/${token}`, label: '홈', icon: Home },
    { href: `/guest/${token}/guide`, label: '안내', icon: BookOpen },
    { href: `/guest/${token}/order`, label: '불멍/BBQ', icon: Flame },
    { href: `/guest/${token}/cafe`, label: '카페', icon: Coffee },
    { href: `/guest/${token}/help`, label: '도움말', icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-cream-dark/30 bg-white pb-[env(safe-area-inset-bottom)] shadow-card md:hidden">
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
                'flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-200 active:scale-95',
                isActive
                  ? 'text-brand-dark'
                  : 'text-brand-dark-faint hover:text-brand-dark-muted'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 transition-all duration-200", 
                  isActive && "scale-110"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden="true" 
              />
              <span className={cn(
                "text-[10px] transition-all duration-200",
                isActive ? "font-semibold" : "font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
