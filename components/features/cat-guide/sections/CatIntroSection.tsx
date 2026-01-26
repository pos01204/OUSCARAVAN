'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { CAT_GUIDE_DATA, CAT_CHARACTERS } from '@/lib/catGuide';
import { CatCharacterCard } from '../CatCharacterCard';

/**
 * 고양이 소개 섹션
 * - 인트로 텍스트 + 캐릭터 캐러셀 (사진 프레임)
 */
export function CatIntroSection() {
  const { intro } = CAT_GUIDE_DATA;

  return (
    <section className="space-y-4" aria-label="우리 동네 고양이들">
      {/* 섹션 타이틀 */}
      <h2 className="text-sm font-semibold text-brand-dark">
        {intro.title}
      </h2>

      {/* 인트로 텍스트 */}
      <div className="bg-white rounded-xl p-4 shadow-soft-sm border border-brand-cream-dark/20">
        <p className="text-sm text-brand-dark leading-relaxed whitespace-pre-line">
          {intro.content}
        </p>
      </div>

      {/* 캐릭터 캐러셀 안내 */}
      <p className="text-[11px] text-brand-dark-faint text-center">
        스와이프하여 고양이들을 만나보세요
      </p>

      {/* 캐릭터 캐러셀 (사진 프레임) */}
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        slidesPerView={2.5}
        spaceBetween={10}
        className="cat-character-swiper !pb-7"
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
