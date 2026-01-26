'use client';

import { cn } from '@/lib/utils';

type TabId = 'order' | 'guide' | 'history';

interface BBQTabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'order', label: '주문하기' },
  { id: 'guide', label: '사용 가이드' },
  { id: 'history', label: '내 주문' },
];

export function BBQTabNav({ activeTab, onTabChange }: BBQTabNavProps) {
  return (
    <nav aria-label="BBQ 페이지 탭" className="mb-5">
      <div className="flex gap-2" role="tablist">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              className={cn(
                // 모바일 터치 타겟: 최소 44px
                "flex-1 min-h-[44px] py-2.5 text-sm font-medium rounded-full transition-all duration-200",
                isActive
                  ? "bg-brand-dark text-white"
                  : "bg-brand-cream/40 text-brand-dark-muted active:bg-brand-cream/60"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
