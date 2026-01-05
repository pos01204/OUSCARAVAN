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
import Image from 'next/image';

export function GuestGuideContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [showBBQCarousel, setShowBBQCarousel] = useState(false);

  const categories = ['전체', ...new Set(GUIDE_DATA.items.map((item) => item.category))];

  const filteredGuideData = GUIDE_DATA.items.filter((item) => {
    const matchesCategory =
      selectedCategory === '전체' || item.category === selectedCategory;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) || item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">이용 안내서</h1>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* 검색 입력 필드 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="안내 내용을 검색하세요..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* BBQ 가이드 캐러셀 토글 */}
      <Button onClick={() => setShowBBQCarousel(!showBBQCarousel)} variant="secondary" className="w-full">
        {showBBQCarousel ? '일반 안내 보기' : '불멍/바베큐 가이드 보기'}
      </Button>

      {showBBQCarousel ? (
        <BBQCarousel slides={BBQ_GUIDE_SLIDES} onClose={() => setShowBBQCarousel(false)} />
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {filteredGuideData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              검색 결과가 없습니다.
            </p>
          ) : (
            filteredGuideData.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {item.content}
                  </p>
                  {item.images && item.images.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {item.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative h-48 w-full overflow-hidden rounded-lg bg-muted"
                        >
                          <Image
                            src={image}
                            alt={`${item.title} 이미지 ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 672px"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.style.display = 'none';
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))
          )}
        </Accordion>
      )}
    </div>
  );
}
