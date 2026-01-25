'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function CafeHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl"
      aria-label="카페 히어로"
    >
      {/* 카페 이미지 */}
      <div className="relative aspect-[16/9] w-full">
        <Image
          src="/images/IMG_8243.jpg"
          alt="오우스마켓 카페"
          fill
          className="object-cover object-[center_40%]"
          priority
        />
        
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
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
            투숙객 전용 혜택
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-2xl font-bold text-white tracking-tight leading-tight"
          >
            10% 할인 쿠폰<br />지금 바로 사용하세요
          </motion.h2>
        </div>
      </div>
    </motion.section>
  );
}
