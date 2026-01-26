'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import Confetti from 'react-confetti';
import { CAT_GUIDE_DATA } from '@/lib/catGuide';
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
          numberOfPieces={60}
          recycle={false}
          colors={['#FFE4E6', '#FFEDD5', '#FEF3C7', '#FB923C', '#F472B6']}
          gravity={0.3}
        />
      )}

      {/* 섹션 타이틀 */}
      <h2 className="flex items-center gap-2 text-base font-bold text-brand-dark mb-3">
        <Icon icon="noto:candy" className="w-5 h-5" />
        <span>{snack.title}</span>
      </h2>

      {/* 츄르 카드 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cat-peach via-cat-cream to-amber-50 rounded-xl p-4 border border-cat-orange/30 shadow-soft-sm">
        {/* 일러스트 영역 */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Icon icon="noto:cat-with-wry-smile" className="w-10 h-10" />
          </motion.div>
          <Icon icon="noto:left-arrow" className="w-5 h-5 text-cat-brown/60" />
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Icon icon="noto:chocolate-bar" className="w-8 h-8" />
          </motion.div>
        </div>

        {/* 텍스트 */}
        <div className="text-center mb-4">
          <p className="text-sm text-brand-dark font-medium leading-relaxed whitespace-pre-line">
            {snack.content}
          </p>
          <p className="text-xs text-brand-dark-muted mt-1 whitespace-pre-line">
            {snack.subContent}
          </p>
        </div>

        {/* CTA 버튼 */}
        <div className="flex justify-center">
          <Button
            onClick={handleCafeClick}
            className="bg-cat-orange hover:bg-cat-orange/90 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md"
          >
            <Icon icon="noto:convenience-store" className="w-4 h-4 mr-1.5" />
            {snack.ctaText}
          </Button>
        </div>
      </div>
    </section>
  );
}
