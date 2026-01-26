'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { CatCharacter } from '@/lib/catGuide';

interface CatCharacterCardProps {
  cat: CatCharacter;
  index: number;
}

/**
 * 고양이 캐릭터 카드
 * - 사진 프레임 (실제 사진 또는 빈 프레임)
 * - 이름 + 특성
 */
export function CatCharacterCard({ cat, index }: CatCharacterCardProps) {
  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden bg-white shadow-soft-sm border border-cat-brown/10"
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* 사진 프레임 영역 */}
      <div className="aspect-square bg-gradient-to-b from-[#FAF8F5] to-cat-cream/30 flex items-center justify-center relative">
        {cat.photoUrl ? (
          <Image
            src={cat.photoUrl}
            alt={cat.name}
            fill
            className="object-cover"
          />
        ) : (
          /* 빈 프레임 - 나중에 사진 추가 가능 */
          <div className="w-full h-full" />
        )}
      </div>

      {/* 정보 영역 */}
      <div className="p-3 text-center bg-white">
        {/* 이름 - Paperlogy */}
        <h4 className="font-cat font-semibold text-brand-dark text-[13px] tracking-tight">
          {cat.name}
        </h4>
        {/* 특성 - 온글잎 박다현체 */}
        <span className="font-cat-body text-[12px] text-brand-dark-muted">
          {cat.trait}
        </span>
      </div>
    </motion.div>
  );
}
