'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Confetti from 'react-confetti';
import { Gift, Percent } from 'lucide-react';
import { BrandMediaLayer } from '@/components/guest/BrandMediaLayer';

interface CouponFlipProps {
  roomNumber: string;
  /** 선택: 뒷면 브랜딩 이미지(카드 영역 내 자동 최적화/클리핑) */
  backImageSrc?: string | null;
}

export function CouponFlip({ roomNumber, backImageSrc }: CouponFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const reduceMotion = useReducedMotion();

  const canPlayConfetti = () => {
    if (reduceMotion) return false;
    if (typeof window === 'undefined') return false;
    try {
      const key = 'guest:couponConfettiShown';
      const already = window.sessionStorage.getItem(key);
      if (already) return false;
      window.sessionStorage.setItem(key, '1');
      return true;
    } catch {
      return true;
    }
  };

  const handleFlip = () => {
    if (!isFlipped) {
      if (canPlayConfetti()) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
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
          numberOfPieces={150}
          colors={['#1A1714', '#E8DCC8', '#C4B896', '#F5F2ED']}
        />
      )}
      <div className="perspective-1000">
        <div className="relative h-48 md:h-52 rounded-2xl overflow-hidden">
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
            className="absolute inset-0 cursor-pointer"
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
            {/* Front Side - 세련된 크림/베이지 디자인 */}
            <Card
              className={`absolute inset-0 h-full w-full cursor-pointer rounded-2xl overflow-hidden border-0 ${
                isFlipped ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)',
                background: 'linear-gradient(135deg, #FAF8F5 0%, #F5F2ED 50%, #EDE8DF 100%)',
                boxShadow: '0 4px 20px rgba(26, 23, 20, 0.08)',
              }}
            >
              <CardContent className="relative flex h-full flex-col items-center justify-center p-5">
                {/* 미니멀 장식 - 좌우 세로선 */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-[#C4B896] to-transparent opacity-40" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-[#C4B896] to-transparent opacity-40" />

                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* 아이콘 */}
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1A1714] mb-3">
                    <Gift className="h-5 w-5 text-[#F5F2ED]" strokeWidth={1.5} />
                  </div>
                  
                  {/* 타이틀 */}
                  <p className="text-xs font-medium text-[#6B6358] tracking-wide mb-1">
                    OUS 게스트 전용
                  </p>
                  
                  {/* 할인율 */}
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-4xl md:text-5xl font-bold text-[#1A1714] tracking-tight">10</span>
                    <div className="flex flex-col items-start">
                      <Percent className="h-5 w-5 text-[#1A1714]" strokeWidth={2.5} />
                      <span className="text-xs font-semibold text-[#1A1714] -mt-0.5">OFF</span>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-[#9C9488] font-medium">
                    카페 이용 시 할인
                  </p>
                  
                  {/* 탭 안내 */}
                  <div className="mt-3 pt-3 border-t border-[#E0DCD3]">
                    <p className="text-[10px] text-[#9C9488]">
                      탭하여 쿠폰 확인
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back Side - 다크 브랜드 디자인 */}
            <Card
              className={`absolute inset-0 h-full w-full cursor-pointer rounded-2xl overflow-hidden border-0 ${
                isFlipped ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: '#1A1714',
                boxShadow: '0 4px 20px rgba(26, 23, 20, 0.15)',
              }}
            >
              <CardContent className="relative h-full w-full p-0 overflow-hidden">
                {/* 브랜딩 이미지 */}
                <BrandMediaLayer
                  imageSrc={backImageSrc}
                  alt="쿠폰 뒷면 브랜딩 이미지"
                  fit="cover"
                  overlayClassName="bg-gradient-to-b from-[#1A1714]/60 via-[#1A1714]/80 to-[#1A1714]/95"
                />

                {/* Content */}
                <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-5 text-center">
                  {/* 아이콘 */}
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#E8DCC8]/20 border border-[#E8DCC8]/30 mb-3">
                    <Gift className="h-5 w-5 text-[#E8DCC8]" strokeWidth={1.5} />
                  </div>
                  
                  {/* 안내 텍스트 */}
                  <h3 className="text-base md:text-lg font-semibold text-[#F5F2ED] mb-3">
                    직원에게 이 화면을 보여주세요
                  </h3>
                  
                  {/* 객실 번호 */}
                  {roomNumber && (
                    <div className="px-5 py-2 rounded-xl bg-[#E8DCC8]/15 border border-[#E8DCC8]/25">
                      <p className="text-[10px] text-[#E8DCC8]/70 mb-0.5">객실 확인</p>
                      <p className="text-2xl md:text-3xl font-bold text-[#F5F2ED] tracking-wide">{roomNumber}</p>
                    </div>
                  )}
                  
                  {/* 탭 안내 */}
                  <p className="text-[10px] text-[#E8DCC8]/50 mt-3">
                    탭하여 앞면 보기
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
