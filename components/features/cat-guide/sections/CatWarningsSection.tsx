'use client';

import { motion } from 'framer-motion';
import { CAT_GUIDE_DATA } from '@/lib/catGuide';

/**
 * 주의사항 섹션
 * - 부드러운 부탁 톤
 * - 크림 배경 카드
 */
export function CatWarningsSection() {
  const { warnings } = CAT_GUIDE_DATA;

  return (
    <section className="space-y-4" aria-label="함께 지켜주세요">
      {/* 섹션 타이틀 */}
      <h2 className="flex items-center gap-2 text-lg font-bold text-brand-dark">
        <span>🙏</span>
        <span>{warnings.title}</span>
      </h2>

      {/* 주의사항 카드 */}
      <div className="bg-cat-cream/40 rounded-2xl p-4 border border-cat-cream/60">
        <ul className="space-y-4">
          {warnings.items.map((item, index) => (
            <motion.li
              key={index}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {/* 아이콘 */}
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center text-lg shadow-sm">
                {item.icon}
              </span>

              {/* 텍스트 */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-medium text-brand-dark">
                  {item.text}
                </p>
                <p className="text-xs text-brand-dark-muted mt-0.5">
                  {item.reason}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
