'use client';

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { CAT_MOTION } from '@/lib/motion';

// 스텝별 noto 이모지 아이콘 매핑
const STEP_ICONS: Record<number, string> = {
  1: 'noto:person-walking',
  2: 'noto:waving-hand',
  3: 'noto:smiling-cat-with-heart-eyes',
};

/**
 * 고양이와 친해지는 법 섹션
 * - 스텝별 카드 + stagger 애니메이션
 */
export function CatTipsSection() {
  const { tips } = CAT_GUIDE_DATA;

  return (
    <section className="space-y-4" aria-label="고양이와 친해지는 법">
      {/* 섹션 타이틀 */}
      <h2 className="flex items-center gap-2 text-base font-bold text-brand-dark">
        <Icon icon="noto:sparkling-heart" className="w-5 h-5" />
        <span>{tips.title}</span>
      </h2>

      {/* 스텝 카드들 */}
      <motion.div
        className="space-y-3"
        variants={CAT_MOTION.stepContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {tips.steps.map((step, index) => (
          <motion.div key={step.step} variants={CAT_MOTION.stepItem}>
            {/* 스텝 카드 */}
            <div className="relative bg-white rounded-xl p-3 shadow-soft-sm border border-cat-peach/30">
              {/* 스텝 번호 배지 */}
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-cat-orange text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {step.step}
              </div>

              <div className="flex items-center gap-3 pl-3">
                {/* 아이콘 */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cat-cream/50 flex items-center justify-center">
                  <Icon icon={STEP_ICONS[step.step] || 'noto:cat'} className="w-6 h-6" />
                </div>

                {/* 텍스트 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-brand-dark">
                    {step.title}
                  </h3>
                  <p className="text-xs text-brand-dark-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 연결선 (마지막 아이템 제외) */}
            {index < tips.steps.length - 1 && (
              <div className="flex justify-center py-0.5" aria-hidden="true">
                <div className="w-0.5 h-3 bg-gradient-to-b from-cat-orange/40 to-cat-orange/10 rounded-full" />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
