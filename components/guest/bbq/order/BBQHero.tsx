'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function BBQHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl"
      aria-label="캠프파이어 히어로"
    >
      {/* 배경 그라데이션 */}
      <div className="relative h-52 bg-gradient-to-br from-[#2b160c] via-[#7a3a14] to-[#2a120a]">
        {/* 배경 패턴/이펙트 (사진 느낌) */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,176,89,0.35),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,125,52,0.25),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.5))]" />
        </div>
        
        {/* 불꽃 파티클 효과 (절제) */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -14, 0],
              opacity: [0.2, 0.45, 0.2],
            }}
            transition={{ 
              duration: 3.2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute bottom-10 left-1/3"
          >
            <Sparkles className="h-3 w-3 text-amber-200/50" />
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, -12, 0],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{ 
              duration: 3.6, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute bottom-12 right-1/3"
          >
            <Sparkles className="h-3 w-3 text-orange-200/40" />
          </motion.div>
        </div>

        {/* 하단 그라데이션 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* 텍스트 영역 */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-xl font-semibold text-white mb-1 tracking-tight"
        >
          오늘 밤, 불멍 하실래요?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-sm text-amber-100/75"
        >
          준비는 저희가, 낭만은 여러분이.
        </motion.p>
      </div>
    </motion.section>
  );
}
