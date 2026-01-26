'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_CATEGORIES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

// '전체' 탭 제거, 시그니처를 기본값으로
const CATEGORY_TABS = [
  { id: 'signature', label: '시그니처' },
  { id: 'coffee', label: '커피' },
  { id: 'nonCoffee', label: '음료' },
  { id: 'bakery', label: '베이커리' },
];

// 핸드메이드 스케치 스타일 SVG 일러스트
const MENU_ILLUSTRATIONS: Record<string, React.ReactNode> = {
  // 커피류
  coffee: (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 14h24v20c0 4-4 6-12 6s-12-2-12-6V14z" className="stroke-amber-700/60" />
      <path d="M32 18h4c2 0 4 2 4 4v4c0 2-2 4-4 4h-4" className="stroke-amber-700/60" />
      <path d="M12 8c2-2 4-2 4 0s2 2 4 0" className="stroke-amber-500/50" />
      <path d="M18 8c2-2 4-2 4 0s2 2 4 0" className="stroke-amber-500/50" />
      <ellipse cx="20" cy="14" rx="12" ry="2" className="stroke-amber-600/40" />
    </svg>
  ),
  // 음료류
  beverage: (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 8h20l-3 32H17L14 8z" className="stroke-amber-700/60" />
      <ellipse cx="24" cy="8" rx="10" ry="2" className="stroke-amber-600/40" />
      <path d="M18 16c4 2 8 2 12 0" className="stroke-amber-500/40" />
      <circle cx="20" cy="24" r="2" className="stroke-amber-400/50" />
      <circle cx="28" cy="28" r="1.5" className="stroke-amber-400/50" />
      <circle cx="22" cy="32" r="1" className="stroke-amber-400/50" />
    </svg>
  ),
  // 베이커리
  bakery: (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 28c0-8 6-14 14-14s14 6 14 14" className="stroke-amber-700/60" />
      <path d="M8 28h32v4c0 4-6 8-16 8S8 36 8 32v-4z" className="stroke-amber-600/50" />
      <path d="M14 22c2-4 6-6 10-6s8 2 10 6" className="stroke-amber-500/40" />
      <path d="M18 18c1-2 3-4 6-4s5 2 6 4" className="stroke-amber-400/30" />
    </svg>
  ),
  // 시그니처
  signature: (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16h24v18c0 4-5 6-12 6s-12-2-12-6V16z" className="stroke-amber-700/60" />
      <ellipse cx="24" cy="16" rx="12" ry="3" className="stroke-amber-600/50" />
      <path d="M16 22c4 2 8 2 12 0" className="stroke-amber-500/40" />
      <path d="M16 28c3 1 6 1 8 0" className="stroke-amber-400/30" />
      <path d="M8 10l4 2m28-2l-4 2" className="stroke-amber-300/40" />
      <circle cx="8" cy="10" r="1.5" className="stroke-amber-400/50 fill-amber-200/30" />
      <circle cx="40" cy="10" r="1.5" className="stroke-amber-400/50 fill-amber-200/30" />
    </svg>
  ),
};

// 카테고리별 일러스트 매핑
const getCategoryIllustration = (categoryId: string) => {
  switch (categoryId) {
    case 'signature':
      return MENU_ILLUSTRATIONS.signature;
    case 'coffee':
      return MENU_ILLUSTRATIONS.coffee;
    case 'nonCoffee':
      return MENU_ILLUSTRATIONS.beverage;
    case 'bakery':
      return MENU_ILLUSTRATIONS.bakery;
    default:
      return MENU_ILLUSTRATIONS.coffee;
  }
};

export function MenuGrid() {
  const [activeCategory, setActiveCategory] = useState('signature');

  const categories = Object.entries(MENU_CATEGORIES);
  const filteredCategories = categories.filter(([key]) => key === activeCategory);

  return (
    <section className="space-y-5" aria-label="카페 메뉴">
      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === tab.id
                ? 'bg-brand-dark text-white'
                : 'bg-brand-cream/40 text-brand-dark-muted hover:bg-brand-cream/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 메뉴 그리드 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {filteredCategories.map(([key, category]) => (
            <div key={key} className="space-y-3">
              {/* 메뉴 아이템 그리드 */}
              <div className="grid grid-cols-2 gap-3">
                {category.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="bg-white rounded-xl overflow-hidden border border-brand-cream-dark/25 hover:border-brand-cream-dark/40 hover:shadow-soft-sm transition-all"
                  >
                    {/* 스케치 일러스트 영역 */}
                    <div className="relative h-20 bg-gradient-to-br from-brand-cream/30 to-amber-50/50 flex items-center justify-center">
                      <div className="w-12 h-12 opacity-80">
                        {getCategoryIllustration(key)}
                      </div>
                      {/* BEST 배지 (시그니처 카테고리 첫 번째 아이템) */}
                      {key === 'signature' && index === 0 && (
                        <Badge 
                          variant="default" 
                          className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5"
                        >
                          BEST
                        </Badge>
                      )}
                    </div>
                    {/* 메뉴 정보 */}
                    <div className="p-3">
                      <h4 className="font-semibold text-brand-dark text-sm mb-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-brand-dark-muted mb-2 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-base font-bold text-brand-dark">
                        {item.price.toLocaleString()}
                        <span className="text-xs font-normal text-brand-dark-muted ml-0.5">원</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
