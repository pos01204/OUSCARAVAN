'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BBQTabNav } from './BBQTabNav';
import { BBQOrderTab } from './order/BBQOrderTab';
import { BBQGuideTab } from './guide/BBQGuideTab';
import { BBQHistoryTab } from './history/BBQHistoryTab';
import { PageHeader } from '@/components/shared/PageHeader';

type TabId = 'order' | 'guide' | 'history';

interface BBQPageContentProps {
  token: string;
}

const TAB_VARIANTS = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export function BBQPageContent({ token }: BBQPageContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>('order');

  return (
    <main role="main" aria-label="불멍/바베큐 페이지">
      {/* 공통 헤더 */}
      <PageHeader 
        title="불멍 / 바베큐" 
        description="바베큐와 불멍을 주문하고 즐겨보세요."
      />

      {/* 탭 네비게이션 */}
      <BBQTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 컨텐츠 */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'order' && (
            <motion.div
              key="order"
              variants={TAB_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <BBQOrderTab token={token} onGuideClick={() => setActiveTab('guide')} />
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              variants={TAB_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <BBQGuideTab />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              variants={TAB_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <BBQHistoryTab 
                token={token} 
                onOrderClick={() => setActiveTab('order')}
                onGuideClick={() => setActiveTab('guide')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
