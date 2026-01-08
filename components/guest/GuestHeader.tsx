'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, ShoppingBag, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuestHeaderProps {
  token: string;
}

export function GuestHeader({ token }: GuestHeaderProps) {
  const pathname = usePathname();
  
  const navItems = [
    { href: `/guest/${token}`, label: '홈', icon: Home },
    { href: `/guest/${token}/guide`, label: '가이드', icon: BookOpen },
    { href: `/guest/${token}/order`, label: '마켓', icon: ShoppingBag },
    { href: `/guest/${token}/help`, label: '도움말', icon: HelpCircle },
  ];

  return (
    <>
      {/* 모바일: 간소화된 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card md:hidden">
        <div className="flex h-14 items-center justify-center px-4">
          <Link href={`/guest/${token}`} className="text-lg font-heading font-bold text-primary">
            OUSCARAVAN
          </Link>
        </div>
      </header>
      
      {/* 데스크톱: 전체 헤더 */}
      <header className="hidden border-b border-border bg-card md:block">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={`/guest/${token}`} className="text-xl font-heading font-bold text-primary">
            OUSCARAVAN
          </Link>
          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
