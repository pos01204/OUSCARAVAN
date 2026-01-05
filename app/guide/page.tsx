'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { GUIDE_DATA, BBQ_GUIDE_SLIDES } from '@/lib/constants';
import { BBQCarousel } from '@/components/features/BBQCarousel';
import { Button } from '@/components/ui/button';

export default function GuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [showBBQCarousel, setShowBBQCarousel] = useState(false);

  const filteredItems = GUIDE_DATA.items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === '전체' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-background pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="가이드 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {GUIDE_DATA.categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Content */}
      <Accordion type="single" collapsible className="w-full">
        {filteredItems.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>
              <div className="text-left">
                <h3 className="font-semibold">{item.title}</h3>
                {item.warning && (
                  <p className="mt-1 text-xs text-destructive">
                    ⚠️ {item.warningText}
                  </p>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{item.content}</p>
                {item.images && item.images.length > 0 && (
                  <div className="space-y-2">
                    {item.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative h-48 w-full overflow-hidden rounded-lg bg-muted"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt={`${item.title} 이미지 ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.innerHTML = `
                                <div class="flex h-full items-center justify-center">
                                  <span class="text-muted-foreground text-sm">이미지 준비 중</span>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {item.hasCarousel && (
                  <Button
                    onClick={() => setShowBBQCarousel(true)}
                    className="w-full"
                  >
                    단계별 가이드 보기
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {filteredItems.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          검색 결과가 없습니다.
        </div>
      )}

      {/* BBQ Carousel Modal */}
      {showBBQCarousel && (
        <BBQCarousel
          slides={BBQ_GUIDE_SLIDES}
          onClose={() => setShowBBQCarousel(false)}
        />
      )}
    </div>
  );
}
