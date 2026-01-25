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
    <nav aria-label="BBQ 페이지 탭" className="-mx-4 px-4 bg-white border-b border-neutral-200">
      <div className="flex" role="tablist">
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
                // 모바일 터치 타겟: 최소 48px 높이
                "relative flex-1 min-h-[48px] py-3 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "text-neutral-900"
                  : "text-neutral-400"
              )}
            >
              {tab.label}
              {/* 선택 인디케이터 */}
              {isActive && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-neutral-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
