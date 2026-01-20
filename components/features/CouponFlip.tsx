'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Confetti from 'react-confetti';
import { Ticket, Percent } from 'lucide-react';
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
        {/* 쿠폰 외곽 - 명확한 쿠폰 형태 */}
        <div className="relative h-40 md:h-44 rounded-2xl overflow-hidden border-2 border-dashed border-[#C4B896] bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F5F2ED] shadow-[0_2px_12px_rgba(26,23,20,0.06)]">
          {/* 쿠폰 좌우 펀치홀 */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-background border-2 border-dashed border-[#C4B896]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-background border-2 border-dashed border-[#C4B896]" />
          
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
            {/* Front Side - 쿠폰 앞면 */}
            <Card
              className={`absolute inset-0 h-full w-full cursor-pointer overflow-hidden border-0 bg-transparent ${
                isFlipped ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)',
              }}
            >
              <CardContent className="relative flex h-full items-center px-8 py-4">
                {/* 좌측: 할인율 강조 */}
                <div className="flex items-center gap-1 pr-6 border-r-2 border-dashed border-[#D4CFC4]">
                  <span className="text-5xl md:text-6xl font-black text-[#1A1714] tracking-tighter leading-none">10</span>
                  <div className="flex flex-col items-start -ml-1">
                    <Percent className="h-5 w-5 text-[#1A1714]" strokeWidth={3} />
                    <span className="text-[10px] font-bold text-[#1A1714] uppercase tracking-wide">OFF</span>
                  </div>
                </div>
                
                {/* 우측: 쿠폰 정보 */}
                <div className="flex-1 pl-6 text-left">
                  {/* 쿠폰 라벨 */}
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1A1714] mb-1.5">
                    <Ticket className="h-3 w-3 text-[#E8DCC8]" strokeWidth={2} />
                    <span className="text-[10px] font-semibold text-[#E8DCC8] uppercase tracking-wide">쿠폰</span>
                  </div>
                  
                  <h3 className="text-sm md:text-base font-bold text-[#1A1714] leading-tight mb-0.5">
                    숙박객 전용 할인
                  </h3>
                  <p className="text-[11px] text-[#6B6358]">
                    카페 이용 시 적용
                  </p>
                  
                  {/* 탭 안내 */}
                  <p className="text-[9px] text-[#9C9488] mt-2">
                    👆 탭하여 쿠폰 사용
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Back Side - 쿠폰 뒷면 (사용 화면) */}
            <Card
              className={`absolute inset-0 h-full w-full cursor-pointer overflow-hidden border-0 ${
                isFlipped ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: '#1A1714',
              }}
            >
              <CardContent className="relative h-full w-full p-0 overflow-hidden">
                {/* 브랜딩 이미지 */}
                <BrandMediaLayer
                  imageSrc={backImageSrc}
                  alt="쿠폰 뒷면 브랜딩 이미지"
                  fit="cover"
                  overlayClassName="bg-gradient-to-r from-[#1A1714]/90 via-[#1A1714]/80 to-[#1A1714]/70"
                />

                {/* Content */}
                <div className="relative z-10 flex h-full w-full items-center px-8 py-4">
                  {/* 좌측: 객실 번호 */}
                  <div className="pr-6 border-r-2 border-dashed border-[#E8DCC8]/30 text-center">
                    <p className="text-[9px] text-[#E8DCC8]/60 uppercase tracking-wider mb-0.5">객실</p>
                    <p className="text-3xl md:text-4xl font-black text-[#F5F2ED] tracking-wide leading-none">{roomNumber || '-'}</p>
                  </div>
                  
                  {/* 우측: 안내 */}
                  <div className="flex-1 pl-6 text-left">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E8DCC8]/20 border border-[#E8DCC8]/30 mb-1.5">
                      <Ticket className="h-3 w-3 text-[#E8DCC8]" strokeWidth={2} />
                      <span className="text-[10px] font-semibold text-[#E8DCC8] uppercase tracking-wide">사용</span>
                    </div>
                    
                    <h3 className="text-sm md:text-base font-bold text-[#F5F2ED] leading-tight mb-0.5">
                      직원에게 보여주세요
                    </h3>
                    <p className="text-[11px] text-[#E8DCC8]/70">
                      10% 할인이 적용됩니다
                    </p>
                    
                    {/* 탭 안내 */}
                    <p className="text-[9px] text-[#E8DCC8]/40 mt-2">
                      👆 탭하여 앞면 보기
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
