'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_CATEGORIES } from '@/lib/constants';

// '전체' 탭 제거, 시그니처를 기본값으로
const CATEGORY_TABS = [
  { id: 'signature', label: '시그니처' },
  { id: 'coffee', label: '커피' },
  { id: 'nonCoffee', label: '음료' },
  { id: 'bakery', label: '베이커리' },
];

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
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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
                    className="bg-white rounded-xl p-4 border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all"
                  >
                    <h4 className="font-semibold text-neutral-900 text-sm mb-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
                      {item.description}
                    </p>
                    <p className="text-base font-bold text-neutral-900">
                      {item.price.toLocaleString()}
                      <span className="text-xs font-normal text-neutral-400 ml-0.5">원</span>
                    </p>
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
