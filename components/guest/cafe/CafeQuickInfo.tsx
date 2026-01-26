'use client';

import { useMemo } from 'react';
import { Clock, Cake, Sun, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CAFE_INFO } from '@/lib/constants';

// 영업 상태 타입
type CafeStatus = 'open' | 'closed' | 'holiday';

// 현재 영업 상태 계산
function getCafeStatus(): { status: CafeStatus; message: string } {
  const now = new Date();
  const day = now.getDay(); // 0 = 일요일, 3 = 수요일
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;

  // 수요일 휴무
  if (day === 3) {
    return { status: 'holiday', message: '오늘 휴무' };
  }

  // 운영시간: 09:00 - 18:00 (평일/주말 동일)
  const openTime = 9 * 60; // 09:00
  const closeTime = 18 * 60; // 18:00

  if (currentTime < openTime) {
    const remainingMinutes = openTime - currentTime;
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    if (hours > 0) {
      return { status: 'closed', message: `${hours}시간 후 오픈` };
    }
    return { status: 'closed', message: `${minutes}분 후 오픈` };
  }

  if (currentTime >= closeTime) {
    return { status: 'closed', message: '영업 종료' };
  }

  // 마감 30분 전
  if (currentTime >= closeTime - 30) {
    return { status: 'open', message: '곧 마감' };
  }

  return { status: 'open', message: '영업중' };
}

// 영업 상태 배지 컴포넌트
function CafeStatusBadge() {
  const { status, message } = useMemo(() => getCafeStatus(), []);

  const badgeStyles = {
    open: 'bg-green-100 text-green-700 border-green-200',
    closed: 'bg-brand-cream/50 text-brand-dark-muted border-brand-cream-dark/30',
    holiday: 'bg-red-50 text-red-600 border-red-200',
  };

  const icons = {
    open: <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />,
    closed: <Clock className="w-3 h-3" />,
    holiday: <AlertTriangle className="w-3 h-3" />,
  };

  return (
    <Badge 
      variant="outline" 
      className={`${badgeStyles[status]} text-xs font-medium px-2 py-0.5 gap-1.5`}
    >
      {icons[status]}
      {message}
    </Badge>
  );
}

// 퀵 정보 아이템
const QUICK_INFO_ITEMS = [
  {
    icon: Sun,
    title: '조식 해결',
    description: '매일 오전 9시 오픈',
    highlight: true,
  },
  {
    icon: Cake,
    title: '조각 케이크',
    description: '기념일엔 케이크와 함께!',
    highlight: false,
  },
];

export function CafeQuickInfo() {
  return (
    <div className="rounded-xl bg-white border border-brand-cream-dark/25 overflow-hidden">
      {/* 헤더: 오늘의 운영 상태 */}
      <div className="px-4 py-3 bg-brand-cream/20 border-b border-brand-cream-dark/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-dark-muted" />
          <span className="text-sm font-medium text-brand-dark">오늘 운영</span>
        </div>
        <CafeStatusBadge />
      </div>

      {/* 퀵 정보 그리드 */}
      <div className="grid grid-cols-2 divide-x divide-brand-cream-dark/15">
        {QUICK_INFO_ITEMS.map((item) => (
          <div
            key={item.title}
            className="p-4 flex flex-col items-center text-center"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              item.highlight 
                ? 'bg-amber-50 text-amber-600' 
                : 'bg-brand-cream/40 text-brand-dark-muted'
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-brand-dark mb-0.5">
              {item.title}
            </p>
            <p className="text-xs text-brand-dark-muted">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* 휴무일 안내 */}
      <div className="px-4 py-2.5 bg-red-50/50 border-t border-red-100/50">
        <p className="text-xs text-red-600 text-center font-medium">
          {CAFE_INFO.hours.closed}
        </p>
      </div>
    </div>
  );
}
