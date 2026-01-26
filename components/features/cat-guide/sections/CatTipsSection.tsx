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
    <section className="space-y-4" aria-label="고양이와 친해지는 법">
      {/* 섹션 타이틀 - Paperlogy */}
      <h2 className="font-cat text-base font-semibold text-brand-dark tracking-tight">
        {tips.title}
      </h2>

      {/* 스텝 카드들 */}
      <motion.div
        className="space-y-2.5"
        variants={CAT_MOTION.stepContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {tips.steps.map((step) => (
          <motion.div 
            key={step.step} 
            variants={CAT_MOTION.stepItem}
            className="flex items-start gap-3.5 bg-white/90 rounded-xl p-4 border border-cat-brown/10"
          >
            {/* 스텝 번호 */}
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cat-brown/60 text-white text-[11px] font-semibold flex items-center justify-center font-cat">
              {step.step}
            </div>

            {/* 텍스트 */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="font-cat font-medium text-[15px] text-brand-dark">
                {step.title}
              </h3>
              <p className="font-cat-body text-[14px] text-brand-dark-muted mt-1 leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
