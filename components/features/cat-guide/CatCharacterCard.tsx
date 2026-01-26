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
      className="relative rounded-xl overflow-hidden bg-white shadow-soft-sm border border-brand-cream-dark/20"
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {/* 사진 프레임 영역 */}
      <div className="aspect-square bg-gradient-to-b from-cat-cream/40 to-cat-peach/20 flex items-center justify-center">
        {cat.photoUrl ? (
          <Image
            src={cat.photoUrl}
            alt={cat.name}
            fill
            className="object-cover"
          />
        ) : (
          <CatPhotoPlaceholder className="w-12 h-12 text-cat-brown/30" />
        )}
      </div>

      {/* 정보 영역 */}
      <div className="p-2 text-center bg-white">
        <h4 className="font-semibold text-brand-dark text-xs">
          {cat.name}
        </h4>
        <span className="text-[10px] text-brand-dark-muted">
          {cat.trait}
        </span>
      </div>
    </motion.div>
  );
}
