'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Card, CardContent } from '@/components/ui/card';
import { MENU_ITEMS } from '@/lib/constants';
import 'swiper/css';

export function MenuCarousel() {
  return (
    <Swiper
      spaceBetween={16}
      slidesPerView={1.2}
      breakpoints={{
        640: {
          slidesPerView: 2.5,
        },
      }}
      className="!pb-4"
    >
      {MENU_ITEMS.map((item) => (
        <SwiperSlide key={item.id}>
          <Card className="overflow-hidden">
            <div className="relative h-48 w-full bg-muted">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
                onError={(e) => {
                  // 이미지 로드 실패 시 플레이스홀더 표시
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `
                      <div class="flex h-full items-center justify-center">
                        <span class="text-muted-foreground text-sm">${item.name}</span>
                      </div>
                    `;
                  }
                }}
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-2 font-semibold text-primary">
                {item.price.toLocaleString()}원
              </p>
            </CardContent>
          </Card>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
