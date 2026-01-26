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
    <section className="space-y-5" aria-label="우리 동네 고양이들">
      {/* 섹션 타이틀 - Paperlogy */}
      <h2 className="font-cat text-base font-semibold text-brand-dark tracking-tight">
        {intro.title}
      </h2>

      {/* 인트로 텍스트 - 온글잎 박다현체 */}
      <div className="rounded-2xl bg-white/90 p-5 shadow-soft-sm border border-cat-brown/10">
        <p className="font-cat-body text-[15px] text-brand-dark leading-[1.9] whitespace-pre-line">
          {intro.content}
        </p>
      </div>

      {/* 캐릭터 캐러셀 안내 */}
      <p className="font-cat-body text-[12px] text-brand-dark-faint text-center tracking-wide">
        스와이프하여 고양이들을 만나보세요
      </p>

      {/* 캐릭터 캐러셀 (사진 프레임) - 하단 여백 추가 */}
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        slidesPerView={2.8}
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
