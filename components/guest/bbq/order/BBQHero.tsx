'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function BBQHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl"
      aria-label="캠프파이어 히어로"
    >
      {/* 실제 캠프파이어 이미지 */}
      <div className="relative aspect-[16/10] w-full">
        <Image
          src="/images/campfire-hero.jpg"
          alt="캠프파이어"
          fill
          className="object-cover object-[center_70%]"
          priority
        />
        
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      </div>

      {/* 텍스트 영역 */}
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        {/* 메인 카피 */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-xs text-amber-200/80 mb-1 tracking-wide"
          >
            Tonight&apos;s Special
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-2xl font-bold text-white tracking-tight leading-tight"
          >
            오늘 밤,<br />불멍 하실래요?
          </motion.h2>
        </div>
      </div>
    </motion.section>
  );
}
