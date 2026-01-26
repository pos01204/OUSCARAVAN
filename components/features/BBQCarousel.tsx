'use client';

import Image from 'next/image';
import { X, Power, Fuel, Flame, Settings, Sparkles, PowerOff } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface BBQCarouselProps {
  slides: Slide[];
  onClose: () => void;
}

// 단계별 아이콘 매핑
const STEP_ICONS: Record<number, React.ElementType> = {
  1: Power,      // 전원 스트립 켜기
  2: Fuel,       // 가스 레버 확인
  3: Flame,      // 점화
  4: Settings,   // 불꽃 조절
  5: Sparkles,   // 즐기기
  6: PowerOff,   // 끄기
};

// 단계별 배경색 (그라데이션 느낌)
const STEP_COLORS: Record<number, string> = {
  1: 'from-amber-100 to-amber-50',
  2: 'from-orange-100 to-orange-50',
  3: 'from-red-100 to-red-50',
  4: 'from-yellow-100 to-yellow-50',
  5: 'from-emerald-100 to-emerald-50',
  6: 'from-slate-100 to-slate-50',
};

export function BBQCarousel({ slides, onClose }: BBQCarouselProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="flex h-full items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-background shadow-2xl overflow-hidden">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <div>
                <h2 className="text-lg font-bold text-foreground">BBQ & 불멍 가이드</h2>
                <p className="text-xs text-muted-foreground">단계별로 따라해보세요</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 캐러셀 */}
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="bbq-carousel"
            >
              {slides.map((slide) => {
                const StepIcon = STEP_ICONS[slide.id] || Flame;
                const bgColor = STEP_COLORS[slide.id] || 'from-brand-cream to-brand-cream/50';
                
                return (
                  <SwiperSlide key={slide.id}>
                    <div className="flex flex-col items-center px-6 py-8">
                      {/* 이미지/아이콘 영역 */}
                      <div className={`relative w-full h-52 rounded-2xl bg-gradient-to-b ${bgColor} flex items-center justify-center mb-6 overflow-hidden`}>
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          sizes="100vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        {/* 이미지 로드 실패 시 아이콘 표시 (항상 렌더링, 이미지 위에 숨김) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <div className="h-20 w-20 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg mb-3">
                            <StepIcon className="h-10 w-10 text-brand-dark" />
                          </div>
                          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm text-brand-dark border-brand-dark/20 font-semibold">
                            STEP {slide.id}
                          </Badge>
                        </div>
                      </div>

                      {/* 텍스트 */}
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-foreground">
                          {slide.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                          {slide.description}
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* 하단 안내 */}
            <div className="px-6 py-4 bg-muted/30 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground">
                좌우로 스와이프하여 다음 단계를 확인하세요
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
