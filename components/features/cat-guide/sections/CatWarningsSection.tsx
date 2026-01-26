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
    <section className="space-y-4" aria-label="함께 지켜주세요">
      {/* 섹션 타이틀 - Paperlogy */}
      <h2 className="font-cat text-base font-semibold text-brand-dark tracking-tight">
        {warnings.title}
      </h2>

      {/* 주의사항 리스트 */}
      <div className="bg-white/90 rounded-2xl p-5 border border-cat-brown/10">
        <ul className="space-y-4">
          {warnings.items.map((item, index) => (
            <motion.li
              key={index}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              {/* X 아이콘 */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cat-brown/10 flex items-center justify-center mt-0.5">
                <X className="w-3 h-3 text-cat-brown/60" />
              </div>

              {/* 텍스트 - 온글잎 박다현체 (크기 키움) */}
              <div className="flex-1 min-w-0">
                <p className="font-cat-body text-[15px] text-brand-dark leading-snug">
                  {item.text}
                </p>
                <p className="font-cat-body text-[13px] text-brand-dark-muted mt-1">
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
