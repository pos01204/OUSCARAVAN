'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Confetti from 'react-confetti';
import { Sparkles, Gift } from 'lucide-react';

interface CouponFlipProps {
  roomNumber: string;
}

export function CouponFlip({ roomNumber }: CouponFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleFlip = () => {
    if (!isFlipped) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 0}
          height={typeof window !== 'undefined' ? window.innerHeight : 0}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      <div className="perspective-1000">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative h-56 md:h-64 cursor-pointer"
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          aria-label="쿠폰 카드 뒤집기"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFlip();
            }
          }}
        >
          {/* Front Side */}
          <Card
            className={`absolute inset-0 h-full w-full cursor-pointer rounded-2xl overflow-hidden shadow-xl ${
              isFlipped ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            <CardContent className="relative flex h-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-800/20">
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-20 h-20 border-2 border-amber-400 rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 border-2 border-orange-400 rounded-full"></div>
                <div className="absolute top-1/2 left-1/4 w-12 h-12 border-2 border-amber-300 rounded-full"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-4"
                >
                  <Gift className="h-12 w-12 md:h-16 md:w-16 mx-auto text-amber-600 dark:text-amber-400" />
                </motion.div>
                <h3 className="mb-2 font-heading text-2xl md:text-3xl font-black text-amber-900 dark:text-amber-100 tracking-tight">
                  OUS 게스트 전용
                </h3>
                <div className="mb-4">
                  <p className="text-3xl md:text-4xl font-black text-orange-600 dark:text-orange-400">
                    10% 할인
                  </p>
                  <p className="text-xs md:text-sm text-amber-700 dark:text-amber-300 mt-1 font-medium">
                    숙박객 특별 혜택
                  </p>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-4">
                  <Sparkles className="h-3 w-3" />
                  <span className="font-medium">카드를 탭하여 뒤집기</span>
                  <Sparkles className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back Side */}
          <Card
            className={`absolute inset-0 h-full w-full cursor-pointer rounded-2xl overflow-hidden shadow-xl ${
              isFlipped ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <CardContent className="relative flex h-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-24 h-24 border-2 border-slate-600 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-20 h-20 border-2 border-slate-500 rounded-full"></div>
                <div className="absolute top-1/2 right-1/4 w-16 h-16 border-2 border-slate-400 rounded-full"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-white">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                    <Gift className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                </div>
                <h3 className="mb-4 font-heading text-xl md:text-2xl font-bold text-white">
                  이 화면을 직원에게 보여주세요
                </h3>
                {roomNumber && (
                  <div className="mb-4 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <p className="text-sm text-white/80 mb-1">객실 번호</p>
                    <p className="text-2xl md:text-3xl font-black text-white">{roomNumber}</p>
                  </div>
                )}
                <div className="flex items-center justify-center gap-1 text-xs text-white/60 mt-4">
                  <Sparkles className="h-3 w-3" />
                  <span>카드를 탭하여 뒤집기</span>
                  <Sparkles className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
