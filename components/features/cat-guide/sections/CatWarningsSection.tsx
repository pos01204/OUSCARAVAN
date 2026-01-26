'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { CAT_GUIDE_DATA } from '@/lib/catGuide';

/**
 * 주의사항 섹션
 * - 부드러운 부탁 톤, 미니멀 디자인
 */
export function CatWarningsSection() {
  const { warnings } = CAT_GUIDE_DATA;

  return (
    <section className="space-y-3" aria-label="함께 지켜주세요">
      {/* 섹션 타이틀 */}
      <h2 className="text-sm font-semibold text-brand-dark">
        {warnings.title}
      </h2>

      {/* 주의사항 리스트 */}
      <div className="bg-cat-cream/30 rounded-xl p-3 border border-brand-cream-dark/20">
        <ul className="space-y-2.5">
          {warnings.items.map((item, index) => (
            <motion.li
              key={index}
              className="flex items-start gap-2.5"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              {/* X 아이콘 */}
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-dark-muted/10 flex items-center justify-center mt-0.5">
                <X className="w-3 h-3 text-brand-dark-muted" />
              </div>

              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-brand-dark">
                  {item.text}
                </p>
                <p className="text-xs text-brand-dark-muted">
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
