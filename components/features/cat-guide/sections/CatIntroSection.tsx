'use client';

import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { CAT_GUIDE_DATA, CAT_CHARACTERS } from '@/lib/catGuide';
import { CatCharacterCard } from '../CatCharacterCard';

/**
 * 고양이 소개 섹션
 * - 말풍선 스타일 인트로 텍스트
 * - Swiper 기반 캐릭터 캐러셀
 */
export function CatIntroSection() {
  const { intro } = CAT_GUIDE_DATA;

  return (
    <section className="space-y-5" aria-label="우리 동네 고양이들">
      {/* 섹션 타이틀 */}
      <h2 className="flex items-center gap-2 text-lg font-bold text-brand-dark">
        <span>🏠</span>
        <span>{intro.title}</span>
      </h2>

      {/* 말풍선 스타일 인트로 */}
      <div className="relative">
        <div className="relative bg-white rounded-2xl p-5 shadow-soft-sm border border-cat-peach/30">
          {/* 고양이 이모지 */}
          <div className="absolute -top-3 -left-1 text-2xl">🐱</div>
          
          {/* 인트로 텍스트 */}
          <p className="text-sm text-brand-dark leading-relaxed whitespace-pre-line pl-4">
            {intro.content}
          </p>
        </div>
        
        {/* 말풍선 꼬리 */}
        <div 
          className="absolute -bottom-2 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"
          aria-hidden="true"
        />
      </div>

      {/* 캐릭터 캐러셀 안내 */}
      <p className="text-xs text-brand-dark-muted text-center">
        ← 스와이프하여 고양이들을 만나보세요 →
      </p>

      {/* 캐릭터 캐러셀 */}
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        slidesPerView={2.3}
        spaceBetween={12}
        className="cat-character-swiper !pb-8"
      >
        {CAT_CHARACTERS.map((cat, index) => (
          <SwiperSlide key={cat.id}>
            <CatCharacterCard cat={cat} index={index} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
