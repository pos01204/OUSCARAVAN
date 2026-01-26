'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { Churu, CatFace } from '../CatIllustrations';
import { Button } from '@/components/ui/button';

interface CatSnackSectionProps {
  onClose: () => void;
}

/**
 * 츄르 안내 섹션
 * - CTA 강조 카드
 * - 카페 연결 버튼 + confetti 효과
 */
export function CatSnackSection({ onClose }: CatSnackSectionProps) {
  const router = useRouter();
  const { snack } = CAT_GUIDE_DATA;
  const [showConfetti, setShowConfetti] = useState(false);

  const handleCafeClick = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      onClose();
      router.push(snack.ctaLink);
    }, 1500);
  };

  return (
    <section className="relative" aria-label="간식 안내">
      {/* Confetti 효과 */}
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 400}
          height={typeof window !== 'undefined' ? window.innerHeight : 600}
          numberOfPieces={80}
          recycle={false}
          colors={['#FFE4E6', '#FFEDD5', '#FEF3C7', '#FB923C', '#F472B6']}
          gravity={0.3}
        />
      )}

      {/* 섹션 타이틀 */}
      <h2 className="flex items-center gap-2 text-lg font-bold text-brand-dark mb-4">
        <span>🍭</span>
        <span>{snack.title}</span>
      </h2>

      {/* 츄르 카드 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cat-peach via-cat-cream to-amber-50 rounded-2xl p-5 border border-cat-orange/30 shadow-soft-md">
        {/* 일러스트 영역 */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <motion.div
            animate={{ x: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <CatFace expression="happy" size={50} />
          </motion.div>
          <motion.div
            className="text-2xl"
            animate={{ x: [-10, 0, -10] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ←
          </motion.div>
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Churu />
          </motion.div>
        </div>

        {/* 텍스트 */}
        <div className="text-center mb-5">
          <p className="text-sm text-brand-dark font-medium leading-relaxed whitespace-pre-line">
            {snack.content}
          </p>
          <p className="text-xs text-brand-dark-muted mt-2 whitespace-pre-line">
            {snack.subContent}
          </p>
        </div>

        {/* CTA 버튼 */}
        <motion.div
          className="flex justify-center"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Button
            onClick={handleCafeClick}
            className="bg-cat-orange hover:bg-cat-orange/90 text-white px-6 py-2.5 rounded-full font-semibold shadow-md"
          >
            <span className="mr-2">🏪</span>
            {snack.ctaText}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
