'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Flame, Coffee, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuestHeaderProps {
  token: string;
}

export function GuestHeader({ token }: GuestHeaderProps) {
  const pathname = usePathname();
  
  const navItems = [
    { href: `/guest/${token}`, label: '홈', icon: Home },
    { href: `/guest/${token}/guide`, label: '안내', icon: BookOpen },
    { href: `/guest/${token}/order`, label: '불멍/BBQ', icon: Flame },
    { href: `/guest/${token}/cafe`, label: '카페', icon: Coffee },
    { href: `/guest/${token}/help`, label: '도움말', icon: HelpCircle },
  ];

  return (
    <>
      {/* 모바일: 간소화된 헤더 — 브랜드 라이트 테마 */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-brand-cream-dark/30 bg-white shadow-[0_1px_3px_rgba(26,23,20,0.05)] md:hidden">
        <div className="flex h-14 items-center justify-center px-4">
          <Link href={`/guest/${token}`} className="text-lg font-heading font-bold text-brand-dark tracking-tight">
            OUSCARAVAN
          </Link>
        </div>
      </header>
      
      {/* 데스크톱: 전체 헤더 */}
      <header className="hidden border-b border-brand-cream-dark/30 bg-white shadow-[0_1px_3px_rgba(26,23,20,0.05)] md:block">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={`/guest/${token}`} className="text-xl font-heading font-bold text-brand-dark tracking-tight">
            OUSCARAVAN
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                    isActive
                      ? 'text-brand-dark bg-background-muted font-semibold'
                      : 'text-brand-dark-muted hover:text-brand-dark hover:bg-background-muted'
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
