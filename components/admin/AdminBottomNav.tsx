'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Home, ShoppingCart, LayoutDashboard, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/lib/store/notifications';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/admin', label: '홈', icon: Home }, // Alert Feed
  { href: '/admin/reservations', label: '예약/배정', icon: Calendar }, // Management
  { href: '/admin/rooms', label: '현장관리', icon: LayoutDashboard }, // Live Board
  { href: '/admin/orders', label: '주문히스토리', icon: ShoppingCart }, // History
  { href: '/admin/announcements', label: '공지', icon: Megaphone },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotificationStore();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden" 
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="관리자 하단 네비게이션"
    >
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href === '/admin' && pathname === '/admin');
          
          // 홈 탭에 읽지 않은 알림 개수 배지 표시
          const showBadge = item.href === '/admin' && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors min-h-[44px] min-w-[44px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {showBadge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                    aria-label={`읽지 않은 알림 ${unreadCount}개`}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
