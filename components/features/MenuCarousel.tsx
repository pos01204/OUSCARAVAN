'use client';

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
            <div className="h-48 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">{item.image}</span>
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
