'use client';

import { motion } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';

export function BBQHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl"
      aria-label="캠프파이어 히어로"
    >
      {/* 배경 그라데이션 + 이미지 영역 */}
      <div className="relative h-48 bg-gradient-to-br from-orange-900 via-amber-800 to-orange-950">
        {/* 배경 패턴/이펙트 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(251,191,36,0.4),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(249,115,22,0.3),transparent_50%)]" />
        </div>
        
        {/* 불꽃 파티클 효과 */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute bottom-10 left-1/4"
          >
            <Sparkles className="h-4 w-4 text-amber-300/60" />
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute bottom-8 right-1/3"
          >
            <Sparkles className="h-3 w-3 text-orange-300/50" />
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, -25, 0],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ 
              duration: 3.5, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-12 right-1/4"
          >
            <Sparkles className="h-5 w-5 text-yellow-300/40" />
          </motion.div>
        </div>

        {/* 중앙 아이콘 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="relative"
          >
            <div className="absolute inset-0 blur-xl bg-orange-500/30 rounded-full scale-150" />
            <Flame className="relative h-16 w-16 text-amber-400 drop-shadow-lg" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* 하단 그라데이션 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-orange-950/90 to-transparent" />
      </div>

      {/* 텍스트 영역 */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-xl font-bold text-white mb-1"
        >
          오늘 밤, 불멍 어때요?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-sm text-amber-100/80"
        >
          캠프파이어의 낭만을 즐겨보세요
        </motion.p>
      </div>
    </motion.section>
  );
}
