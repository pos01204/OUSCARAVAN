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
      {/* 히어로 이미지 - 높이 증가 */}
      <div className="relative h-52 w-full">
        <Image
          src="/images/campfire-hero.jpg"
          alt="캠프파이어"
          fill
          className="object-cover object-center"
          priority
        />
        
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* 텍스트 영역 */}
      <div className="absolute inset-0 flex items-end p-5">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-xs text-amber-200/90 mb-1 tracking-wide font-medium"
          >
            Tonight&apos;s Special
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-xl font-bold text-white tracking-tight leading-tight"
          >
            오늘 밤, 불멍 하실래요?
          </motion.h2>
        </div>
      </div>
    </motion.section>
  );
}
