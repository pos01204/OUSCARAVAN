'use client';

import { motion } from 'framer-motion';
import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { CAT_MOTION } from '@/lib/motion';

/**
 * 고양이와 친해지는 법 섹션
 * - 스텝별 카드 + stagger 애니메이션
 * - 화살표 연결선
 */
export function CatTipsSection() {
  const { tips } = CAT_GUIDE_DATA;

  return (
    <section className="space-y-5" aria-label="고양이와 친해지는 법">
      {/* 섹션 타이틀 */}
      <h2 className="flex items-center gap-2 text-lg font-bold text-brand-dark">
        <span>💕</span>
        <span>{tips.title}</span>
      </h2>

      {/* 스텝 카드들 */}
      <motion.div
        className="space-y-4"
        variants={CAT_MOTION.stepContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {tips.steps.map((step, index) => (
          <motion.div key={step.step} variants={CAT_MOTION.stepItem}>
            {/* 스텝 카드 */}
            <div className="relative bg-white rounded-2xl p-4 shadow-soft-sm border border-cat-peach/30">
              {/* 스텝 번호 배지 */}
              <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-cat-orange text-white text-xs font-bold flex items-center justify-center shadow-md">
                {step.step}
              </div>

              <div className="flex items-start gap-4 pl-4">
                {/* 아이콘 */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cat-cream/50 flex items-center justify-center text-2xl">
                  {step.icon}
                </div>

                {/* 텍스트 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-brand-dark mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-brand-dark-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 연결 화살표 (마지막 아이템 제외) */}
            {index < tips.steps.length - 1 && (
              <div className="flex justify-center py-1" aria-hidden="true">
                <motion.div
                  className="w-0.5 h-4 bg-gradient-to-b from-cat-orange/60 to-cat-orange/20 rounded-full"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
