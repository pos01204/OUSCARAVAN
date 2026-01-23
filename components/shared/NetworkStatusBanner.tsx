'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetworkStatusBannerProps {
  className?: string;
}

export function NetworkStatusBanner({ className }: NetworkStatusBannerProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className={cn(
        'mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-semibold">인터넷 연결이 불안정해요</p>
        <p className="text-xs text-amber-800/90">
          연결되면 주문/체크인 상태가 자동으로 다시 갱신됩니다.
        </p>
      </div>
    </div>
  );
}

