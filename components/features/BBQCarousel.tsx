'use client';

import { X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Button } from '@/components/ui/button';
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
          <div className="relative w-full max-w-lg rounded-lg bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="h-[500px]"
            >
              {slides.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 h-48 w-full rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">
                        {slide.image}
                      </span>
                    </div>
                    <h3 className="mb-2 text-2xl font-heading font-bold">
                      {slide.title}
                    </h3>
                    <p className="text-muted-foreground">{slide.description}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
