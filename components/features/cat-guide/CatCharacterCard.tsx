'use client';

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import type { CatCharacter } from '@/lib/catGuide';

// 캐릭터별 고품질 noto 이모지 매핑
const CAT_ICONS: Record<string, string> = {
  cheese: 'noto:grinning-cat',
  black: 'noto:black-cat',
  calico: 'noto:cat',
  tiger: 'noto:cat-with-wry-smile',
  snow: 'noto:smiling-cat',
};

interface CatCharacterCardProps {
  cat: CatCharacter;
  index: number;
}

/**
 * 고양이 캐릭터 카드
 * - 고품질 이모지 아이콘 + 이름 + 특성
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
      className={`relative rounded-xl p-3 text-center shadow-soft-sm border border-cat-peach/30 ${getBgColor(cat.color)}`}
      whileTap={{ scale: 0.92, rotate: index % 2 === 0 ? -3 : 3 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
    >
      {/* 고품질 고양이 아이콘 */}
      <Icon icon={CAT_ICONS[cat.id] || 'noto:cat'} className="w-10 h-10 mx-auto mb-1.5" />

      {/* 이름 */}
      <h4 className="font-bold text-brand-dark text-xs mb-0.5">
        {cat.name}
      </h4>

      {/* 특성 배지 */}
      <span className="inline-block px-1.5 py-0.5 rounded-full bg-white/60 text-[10px] text-brand-dark-muted font-medium">
        {cat.trait}
      </span>
    </motion.div>
  );
}
