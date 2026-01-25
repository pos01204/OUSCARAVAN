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
    <nav aria-label="BBQ 페이지 탭">
      <div className="relative">
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
                  "relative flex-1 py-3 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "text-brand-dark"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {/* 선택 인디케이터 */}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-dark rounded-full" />
                )}
              </button>
            );
          })}
        </div>
        {/* 하단 경계선 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border/40" />
      </div>
    </nav>
  );
}
