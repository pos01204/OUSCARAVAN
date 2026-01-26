'use client';

import { motion } from 'framer-motion';
import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { CAT_MOTION } from '@/lib/motion';

/**
 * 고양이와 친해지는 법 섹션
 * - 스텝별 카드 (이모티콘 없이 번호만)
 */
export function CatTipsSection() {
  const { tips } = CAT_GUIDE_DATA;

  return (
    <section className="space-y-3" aria-label="고양이와 친해지는 법">
      {/* 섹션 타이틀 */}
      <h2 className="text-sm font-semibold text-brand-dark">
        {tips.title}
      </h2>

      {/* 스텝 카드들 */}
      <motion.div
        className="space-y-2"
        variants={CAT_MOTION.stepContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {tips.steps.map((step) => (
          <motion.div 
            key={step.step} 
            variants={CAT_MOTION.stepItem}
            className="flex items-start gap-3 bg-white rounded-lg p-3 border border-brand-cream-dark/20"
          >
            {/* 스텝 번호 */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-dark text-white text-xs font-semibold flex items-center justify-center">
              {step.step}
            </div>

            {/* 텍스트 */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="font-medium text-sm text-brand-dark">
                {step.title}
              </h3>
              <p className="text-xs text-brand-dark-muted mt-0.5">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
