'use client';

import { motion } from 'framer-motion';
import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { CatFace, PawPrint } from '../CatIllustrations';
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
    <section className="text-center py-6" aria-label="마무리">
      {/* 발자국 장식 */}
      <div className="flex items-center justify-center gap-3 mb-5" aria-hidden="true">
        <motion.div
          animate={{ y: [0, -4, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <PawPrint className="w-4 h-4 text-cat-brown/40" />
        </motion.div>
        <span className="text-cat-brown/30">·</span>
        <motion.div
          animate={{ y: [0, -4, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        >
          <PawPrint className="w-5 h-5 text-cat-brown/50" />
        </motion.div>
        <span className="text-cat-brown/30">·</span>
        <motion.div
          animate={{ y: [0, -4, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        >
          <PawPrint className="w-4 h-4 text-cat-brown/40" />
        </motion.div>
      </div>

      {/* 감성 메시지 */}
      <p className="font-cat text-base text-brand-dark leading-relaxed whitespace-pre-line mb-5">
        "{footer.message}"
      </p>

      {/* 고양이 얼굴 */}
      <motion.div
        className="inline-block mb-6"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <CatFace expression="love" size={48} />
      </motion.div>

      {/* 닫기 버튼 */}
      <div>
        <Button
          variant="outline"
          onClick={onClose}
          className="px-8 py-2 rounded-full border-cat-brown/30 text-brand-dark hover:bg-cat-cream/30"
        >
          닫기
        </Button>
      </div>
    </section>
  );
}
