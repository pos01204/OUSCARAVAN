'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { CatCharacter } from '@/lib/catGuide';
import { CatPhotoPlaceholder } from './CatIllustrations';

interface CatCharacterCardProps {
  cat: CatCharacter;
  index: number;
}

/**
 * 고양이 캐릭터 카드
 * - 사진 플레이스홀더 프레임 (나중에 실제 사진으로 대체 가능)
 * - 이름 + 특성
 */
export function CatCharacterCard({ cat, index }: CatCharacterCardProps) {
  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden bg-white shadow-soft-sm border border-brand-cream-dark/12"
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* 사진 프레임 영역 */}
      <div className="aspect-square bg-gradient-to-b from-[#FAF8F5] to-cat-cream/20 flex items-center justify-center relative">
        {cat.photoUrl ? (
          <Image
            src={cat.photoUrl}
            alt={cat.name}
            fill
            className="object-cover"
          />
        ) : (
          <CatPhotoPlaceholder className="w-10 h-10 text-cat-brown/20" />
        )}
      </div>

      {/* 정보 영역 */}
      <div className="p-2.5 text-center bg-white/90">
        {/* 이름 - Paperlogy */}
        <h4 className="font-cat font-semibold text-brand-dark text-[11px] tracking-tight">
          {cat.name}
        </h4>
        {/* 특성 - 온글잎 박다현체 */}
        <span className="font-cat-body text-[9px] text-brand-dark-muted">
          {cat.trait}
        </span>
      </div>
    </motion.div>
  );
}
