'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </Button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b bg-card shadow-lg">
          <nav className="container mx-auto px-4 py-4" aria-label="주요 네비게이션">
            <div className="flex flex-col gap-2">
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                대시보드
              </Link>
              <Link
                href="/admin/reservations"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                예약 관리
              </Link>
              <Link
                href="/admin/rooms"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                방 관리
              </Link>
              <Link
                href="/admin/orders"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                주문 관리
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
