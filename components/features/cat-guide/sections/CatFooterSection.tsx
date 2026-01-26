'use client';

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { Button } from '@/components/ui/button';

interface CatFooterSectionProps {
  onClose: () => void;
}

/**
 * 마무리 섹션
 * - 감성 메시지 + 닫기 버튼
 */
export function CatFooterSection({ onClose }: CatFooterSectionProps) {
  const { footer } = CAT_GUIDE_DATA;

  return (
    <section className="text-center py-4" aria-label="마무리">
      {/* 발자국 장식 */}
      <div className="flex items-center justify-center gap-2 mb-4 opacity-50" aria-hidden="true">
        <Icon icon="noto:paw-prints" className="w-4 h-4" />
        <span className="text-cat-brown/30">·</span>
        <Icon icon="noto:paw-prints" className="w-5 h-5" />
        <span className="text-cat-brown/30">·</span>
        <Icon icon="noto:paw-prints" className="w-4 h-4" />
      </div>

      {/* 감성 메시지 */}
      <p className="font-cat text-sm text-brand-dark leading-relaxed whitespace-pre-line mb-4">
        &ldquo;{footer.message}&rdquo;
      </p>

      {/* 고양이 이모지 */}
      <motion.div
        className="inline-block mb-5"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon icon="noto:smiling-cat-with-heart-eyes" className="w-12 h-12" />
      </motion.div>

      {/* 닫기 버튼 */}
      <div>
        <Button
          variant="outline"
          onClick={onClose}
          className="px-6 py-2 rounded-full border-cat-brown/30 text-brand-dark hover:bg-cat-cream/30 text-sm"
        >
          닫기
        </Button>
      </div>
    </section>
  );
}
