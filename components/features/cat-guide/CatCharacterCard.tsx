'use client';

import { motion } from 'framer-motion';
import type { CatCharacter } from '@/lib/catGuide';

interface CatCharacterCardProps {
  cat: CatCharacter;
  index: number;
}

/**
 * 고양이 캐릭터 카드
 * - 이모지 + 이름 + 특성
 * - 터치 시 통통 튀는 효과
 */
export function CatCharacterCard({ cat, index }: CatCharacterCardProps) {
  // 캐릭터별 배경색
  const getBgColor = (color: string) => {
    const colors: Record<string, string> = {
      amber: 'bg-amber-50',
      slate: 'bg-slate-100',
      orange: 'bg-orange-50',
      white: 'bg-gray-50',
    };
    return colors[color] || 'bg-cat-cream/30';
  };

  return (
    <motion.div
      className={`relative rounded-2xl p-4 text-center shadow-soft-sm border border-cat-peach/30 ${getBgColor(cat.color)}`}
      whileTap={{ scale: 0.92, rotate: index % 2 === 0 ? -3 : 3 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
    >
      {/* 이모지 */}
      <div className="text-4xl mb-2">{cat.emoji}</div>

      {/* 이름 */}
      <h4 className="font-bold text-brand-dark text-sm mb-1">
        {cat.name}
      </h4>

      {/* 특성 배지 */}
      <span className="inline-block px-2 py-0.5 rounded-full bg-white/60 text-xs text-brand-dark-muted font-medium">
        {cat.trait}
      </span>

      {/* 설명 (호버 시 표시 - 모바일에서는 항상 표시) */}
      <p className="text-[10px] text-brand-dark-faint mt-2 leading-snug">
        {cat.description}
      </p>
    </motion.div>
  );
}
