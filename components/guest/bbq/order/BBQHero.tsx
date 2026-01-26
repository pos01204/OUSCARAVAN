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
      {/* 축소된 히어로 이미지 */}
      <div className="relative h-36 w-full">
        <Image
          src="/images/campfire-hero.jpg"
          alt="캠프파이어"
          fill
          className="object-cover object-[center_60%]"
          priority
        />
        
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* 텍스트 영역 */}
      <div className="absolute inset-0 flex items-end p-4">
        <div className="flex items-end justify-between w-full">
          {/* 메인 카피 */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-[10px] text-amber-200/90 mb-0.5 tracking-wide font-medium"
            >
              Tonight&apos;s Special
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-lg font-bold text-white tracking-tight leading-tight"
            >
              오늘 밤, 불멍 하실래요?
            </motion.h2>
          </div>

          {/* 가격 힌트 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-right"
          >
            <p className="text-[10px] text-white/60 mb-0.5">시작가</p>
            <p className="text-sm font-bold text-white">20,000원~</p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
