'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Ticket, Percent } from 'lucide-react';

interface CouponFlipProps {
  roomNumber: string;
  /** 선택: 뒷면 브랜딩 이미지(카드 영역 내 자동 최적화/클리핑) */
  backImageSrc?: string | null;
}

export function CouponFlip({ roomNumber }: CouponFlipProps) {
  const [isUsing, setIsUsing] = useState(false);
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

  const handleToggle = () => {
    if (!isUsing) {
      if (canPlayConfetti()) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
    setIsUsing(!isUsing);
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
      
      {/* 쿠폰 외곽 */}
      <div 
        className="relative h-36 md:h-40 rounded-2xl overflow-hidden border-2 border-dashed border-[#C4B896] shadow-[0_2px_12px_rgba(26,23,20,0.08)] cursor-pointer"
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-label={isUsing ? "쿠폰 앞면 보기" : "쿠폰 사용하기"}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        {/* 쿠폰 좌우 펀치홀 */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#F7F7F7] border-2 border-dashed border-[#C4B896] z-20" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-[#F7F7F7] border-2 border-dashed border-[#C4B896] z-20" />
        
        <AnimatePresence mode="wait">
          {!isUsing ? (
            /* 앞면 - 쿠폰 정보 */
            <motion.div
              key="front"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-[#FBF9F4] flex items-center px-6 md:px-8"
            >
              {/* 좌측: 할인율 강조 */}
              <div className="flex items-center gap-1 pr-5 md:pr-6 border-r-2 border-dashed border-[#D4CFC4]">
                <span className="text-4xl md:text-5xl font-black text-[#1A1714] tracking-tighter leading-none">10</span>
                <div className="flex flex-col items-start -ml-1">
                  <Percent className="h-4 w-4 md:h-5 md:w-5 text-[#1A1714]" strokeWidth={3} />
                  <span className="text-[9px] md:text-[10px] font-bold text-[#1A1714] uppercase tracking-wide">OFF</span>
                </div>
              </div>
              
              {/* 우측: 쿠폰 정보 */}
              <div className="flex-1 pl-5 md:pl-6 text-left">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1A1714] mb-1">
                  <Ticket className="h-3 w-3 text-[#E8DCC8]" strokeWidth={2} />
                  <span className="text-[9px] md:text-[10px] font-semibold text-[#E8DCC8] uppercase tracking-wide">쿠폰</span>
                </div>
                
                <h3 className="text-sm md:text-base font-bold text-[#1A1714] leading-tight mb-0.5">
                  숙박객 전용 할인
                </h3>
                <p className="text-[10px] md:text-[11px] text-[#6B6358]">
                  카페 이용 시 적용
                </p>
                
                <p className="text-[9px] text-[#9C9488] mt-1.5">
                  탭하여 쿠폰 사용
                </p>
              </div>
            </motion.div>
          ) : (
            /* 뒷면 - 사용 화면 */
            <motion.div
              key="back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-[#1A1714] flex items-center px-6 md:px-8"
            >
              {/* 좌측: 객실 번호 */}
              <div className="pr-5 md:pr-6 border-r-2 border-dashed border-[#E8DCC8]/30 text-center">
                <p className="text-[9px] text-[#E8DCC8]/60 uppercase tracking-wider mb-0.5">객실</p>
                <p className="text-3xl md:text-4xl font-black text-[#F5F2ED] tracking-wide leading-none">{roomNumber || '-'}</p>
              </div>
              
              {/* 우측: 안내 */}
              <div className="flex-1 pl-5 md:pl-6 text-left">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E8DCC8]/20 border border-[#E8DCC8]/30 mb-1">
                  <Ticket className="h-3 w-3 text-[#E8DCC8]" strokeWidth={2} />
                  <span className="text-[9px] md:text-[10px] font-semibold text-[#E8DCC8] uppercase tracking-wide">사용</span>
                </div>
                
                <h3 className="text-sm md:text-base font-bold text-[#F5F2ED] leading-tight mb-0.5">
                  직원에게 보여주세요
                </h3>
                <p className="text-[10px] md:text-[11px] text-[#E8DCC8]/70">
                  10% 할인이 적용됩니다
                </p>
                
                <p className="text-[9px] text-[#E8DCC8]/40 mt-1.5">
                  탭하여 앞면 보기
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
