'use client';

import Link from 'next/link';
import Image from 'next/image';
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
      {/* 모바일: 간소화된 헤더 — 오션뷰 배경 브랜딩 */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-brand-cream-dark/20 shadow-card md:hidden overflow-hidden">
        {/* 배경 이미지 레이어 */}
        <div className="absolute inset-0">
          <Image
            src="/images/헤더용/IMG_1922.jpeg"
            alt=""
            fill
            className="object-cover object-top"
            priority
          />
          {/* 반투명 오버레이 - 은은하게 바다/하늘이 비치도록 */}
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />
        </div>
        
        {/* 콘텐츠 레이어 */}
        <div className="relative flex h-14 items-center justify-center px-4">
          <Link href={`/guest/${token}`} className="text-lg font-heading font-bold text-brand-dark tracking-tight">
            OUSCARAVAN
          </Link>
        </div>
      </header>
      
      {/* 데스크톱: 전체 헤더 — 오션뷰 배경 브랜딩 */}
      <header className="hidden border-b border-brand-cream-dark/20 shadow-card md:block overflow-hidden relative">
        {/* 배경 이미지 레이어 */}
        <div className="absolute inset-0">
          <Image
            src="/images/헤더용/IMG_1922.jpeg"
            alt=""
            fill
            className="object-cover object-top"
            priority
          />
          {/* 반투명 오버레이 */}
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />
        </div>
        
        {/* 콘텐츠 레이어 */}
        <div className="relative container mx-auto flex h-16 items-center justify-between px-4">
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
                      ? 'text-brand-dark bg-white/60 font-semibold'
                      : 'text-brand-dark-muted hover:text-brand-dark hover:bg-white/40'
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
