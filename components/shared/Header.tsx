'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, ShoppingBag, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', label: '홈', icon: Home },
  { href: '/guide', label: '가이드', icon: BookOpen },
  { href: '/market', label: '마켓', icon: ShoppingBag },
  { href: '/help', label: '도움말', icon: HelpCircle },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="hidden border-b border-border bg-card md:block">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/home" className="text-xl font-heading font-bold text-primary">
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
  );
}
