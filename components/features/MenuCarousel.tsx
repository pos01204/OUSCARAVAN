'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Card, CardContent } from '@/components/ui/card';
import { MENU_CATEGORIES } from '@/lib/constants';
import 'swiper/css';

interface MenuCarouselProps {
  categoryId?: string;
}

export function MenuCarousel({ categoryId }: MenuCarouselProps) {
  const categories = Object.values(MENU_CATEGORIES);
  const displayCategories = categoryId 
    ? categories.filter(cat => cat.id === categoryId)
    : categories;

  return (
    <div className="space-y-8">
      {displayCategories.map((category) => (
        <div key={category.id} className="space-y-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
              {category.koreanName}
            </h3>
          </div>
          <Swiper
            spaceBetween={16}
            slidesPerView={1.2}
            breakpoints={{
              640: {
                slidesPerView: 2.5,
              },
              1024: {
                slidesPerView: 3.5,
              },
            }}
            className="!pb-4"
          >
            {category.items.map((item) => (
              <SwiperSlide key={item.id}>
                <Card className="overflow-hidden h-full transition-all hover:shadow-lg">
                  <div className="relative h-48 w-full bg-gradient-to-br from-muted to-muted/50">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      onError={(e) => {
                        // 이미지 로드 실패 시 플레이스홀더 표시
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `
                            <div class="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <span class="text-muted-foreground text-sm font-medium">${item.name}</span>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base mb-1">{item.name}</h3>
                    <p className="mt-1 text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.description}
                    </p>
                    <p className="mt-2 font-bold text-lg text-primary">
                      {item.price.toLocaleString()}원
                    </p>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ))}
    </div>
  );
}
