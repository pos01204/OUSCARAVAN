'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Confetti from 'react-confetti';

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
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative h-48 cursor-pointer"
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
            className={`absolute inset-0 h-full w-full cursor-pointer ${
              isFlipped ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            <CardContent className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#8B6914] to-[#D4AF37] p-6 text-center">
              <h3 className="mb-2 font-heading text-2xl font-bold text-white">
                OUS 게스트 전용
              </h3>
              <p className="text-lg font-semibold text-white">10% 할인</p>
              <p className="mt-4 text-xs text-white/80">카드를 탭하여 뒤집기</p>
            </CardContent>
          </Card>

          {/* Back Side */}
          <Card
            className={`absolute inset-0 h-full w-full cursor-pointer ${
              isFlipped ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <CardContent className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#221E1D] to-[#3A3534] p-6 text-center text-white">
              <h3 className="mb-2 font-heading text-xl font-bold">
                이 화면을 직원에게 보여주세요
              </h3>
              {roomNumber && (
                <p className="mt-4 text-lg font-semibold">객실: {roomNumber}</p>
              )}
              <p className="mt-4 text-xs text-white/80">카드를 탭하여 뒤집기</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
