'use client';

import { useState, useMemo } from 'react';
import { Search, AlertCircle, BookOpen, Lightbulb, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GUIDE_DATA, BBQ_GUIDE_SLIDES } from '@/lib/constants';
import { BBQCarousel } from '@/components/features/BBQCarousel';
import { StepByStepGuide } from '@/components/features/StepByStepGuide';
import { GuideChecklist } from '@/components/features/GuideChecklist';
import { GuideFAQ } from '@/components/features/GuideFAQ';
import { GuideTroubleshooting } from '@/components/features/GuideTroubleshooting';
import { QuickAccess } from '@/components/features/QuickAccess';
import Image from 'next/image';
import type { GuideItem } from '@/types';

interface GuestGuideContentProps {
  token?: string;
}

export function GuestGuideContent({ token }: GuestGuideContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [showBBQCarousel, setShowBBQCarousel] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);

  const categories = ['전체', ...new Set(GUIDE_DATA.items.map((item) => item.category))];

  // 검색 및 필터링
  const filteredGuideData = useMemo(() => {
    return GUIDE_DATA.items.filter((item) => {
      const matchesCategory =
        selectedCategory === '전체' || item.category === selectedCategory;
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(searchLower) ||
        item.content.toLowerCase().includes(searchLower) ||
        item.overview?.toLowerCase().includes(searchLower) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        item.faq?.some(
          (faq) =>
            faq.question.toLowerCase().includes(searchLower) ||
            faq.answer.toLowerCase().includes(searchLower)
        );

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // 선택된 가이드 항목
  const selectedGuide = selectedGuideId
    ? GUIDE_DATA.items.find((item) => item.id === selectedGuideId)
    : null;

  // 가이드 카드 클릭 핸들러
  const handleGuideClick = (guideId: string) => {
    if (selectedGuideId === guideId) {
      setSelectedGuideId(null);
    } else {
      setSelectedGuideId(guideId);
      // 스크롤을 해당 가이드로 이동
      setTimeout(() => {
        const element = document.getElementById(`guide-${guideId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // BBQ 가이드가 선택된 경우
  const bbqGuide = GUIDE_DATA.items.find((item) => item.id === 'bbq');

  return (
    <main className="space-y-6" role="main" aria-label="안내 페이지">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">이용 안내서</h1>
        <p className="text-sm text-muted-foreground">
          숙박 이용에 필요한 모든 정보를 확인하세요
        </p>
      </div>

      {/* 빠른 접근 */}
      <QuickAccess token={token} />

      {/* 검색 및 필터 */}
      <section className="space-y-4" aria-label="검색 및 필터">
        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="카테고리 필터">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
              role="tab"
              aria-selected={selectedCategory === category}
              aria-controls={`category-${category}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* 검색 입력 필드 */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="안내 내용을 검색하세요..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="가이드 검색"
          />
        </div>
      </section>

      {/* BBQ 가이드 캐러셀 토글 */}
      {bbqGuide && (
        <Button
          onClick={() => setShowBBQCarousel(!showBBQCarousel)}
          variant="secondary"
          className="w-full"
          aria-label="BBQ 가이드 캐러셀 열기/닫기"
        >
          {showBBQCarousel ? '일반 안내 보기' : '불멍/바베큐 가이드 보기'}
        </Button>
      )}

      {showBBQCarousel ? (
        <section aria-label="BBQ 가이드 캐러셀">
          <BBQCarousel slides={BBQ_GUIDE_SLIDES} onClose={() => setShowBBQCarousel(false)} />
        </section>
      ) : (
        <section aria-label="가이드 목록">
          {filteredGuideData.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">검색 결과가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredGuideData.map((item) => {
                const isExpanded = selectedGuideId === item.id;
                return (
                  <div key={item.id} id={`guide-${item.id}`}>
                    {/* 가이드 카드 */}
                    <Card
                      className={`transition-all cursor-pointer hover:shadow-lg ${
                        isExpanded ? 'border-primary shadow-md' : ''
                      }`}
                      onClick={() => handleGuideClick(item.id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-controls={`guide-content-${item.id}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleGuideClick(item.id);
                        }
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                              {item.warning && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  주의
                                </Badge>
                              )}
                            </div>
                            {item.overview && (
                              <p className="text-sm text-muted-foreground">{item.overview}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {item.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      {!isExpanded && (
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {item.steps && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {item.steps.length}단계
                              </span>
                            )}
                            {item.faq && item.faq.length > 0 && (
                              <span>FAQ {item.faq.length}개</span>
                            )}
                            {item.troubleshooting && item.troubleshooting.length > 0 && (
                              <span>문제 해결 {item.troubleshooting.length}개</span>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>

                    {/* 확장된 가이드 내용 */}
                    {isExpanded && (
                      <div
                        id={`guide-content-${item.id}`}
                        className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300"
                        role="region"
                        aria-labelledby={`guide-title-${item.id}`}
                      >
                        {/* 기본 정보 */}
                        <Card>
                          <CardHeader>
                            <CardTitle>상세 안내</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {item.content}
                            </p>

                            {/* 경고 */}
                            {item.warning && item.warningText && (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                  {item.warningText}
                                </p>
                              </div>
                            )}

                            {/* 이미지 */}
                            {item.images && item.images.length > 0 && (
                              <div className="space-y-2">
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
                                          target.parentElement.innerHTML = `
                                            <div class="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                              <span class="text-muted-foreground text-sm font-medium">${item.title}</span>
                                            </div>
                                          `;
                                        }
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 유용한 팁 */}
                            {item.tips && item.tips.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-foreground flex items-center gap-2">
                                  <Lightbulb className="h-4 w-4 text-primary" />
                                  유용한 팁
                                </h4>
                                <ul className="space-y-1 pl-4">
                                  {item.tips.map((tip, index) => (
                                    <li key={index} className="text-sm text-muted-foreground list-disc">
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* 탭으로 구성된 상세 정보 */}
                        <Tabs defaultValue="steps" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            {item.steps && item.steps.length > 0 && (
                              <TabsTrigger value="steps">단계별 가이드</TabsTrigger>
                            )}
                            {item.checklist && item.checklist.length > 0 && (
                              <TabsTrigger value="checklist">체크리스트</TabsTrigger>
                            )}
                            {item.faq && item.faq.length > 0 && (
                              <TabsTrigger value="faq">FAQ</TabsTrigger>
                            )}
                            {item.troubleshooting && item.troubleshooting.length > 0 && (
                              <TabsTrigger value="troubleshooting">문제 해결</TabsTrigger>
                            )}
                          </TabsList>

                          {item.steps && item.steps.length > 0 && (
                            <TabsContent value="steps" className="mt-4">
                              <StepByStepGuide steps={item.steps} />
                            </TabsContent>
                          )}

                          {item.checklist && item.checklist.length > 0 && (
                            <TabsContent value="checklist" className="mt-4">
                              <GuideChecklist items={item.checklist} checklistId={item.id} />
                            </TabsContent>
                          )}

                          {item.faq && item.faq.length > 0 && (
                            <TabsContent value="faq" className="mt-4">
                              <GuideFAQ faqs={item.faq} searchable={true} />
                            </TabsContent>
                          )}

                          {item.troubleshooting && item.troubleshooting.length > 0 && (
                            <TabsContent value="troubleshooting" className="mt-4">
                              <GuideTroubleshooting items={item.troubleshooting} />
                            </TabsContent>
                          )}
                        </Tabs>

                        {/* 관련 가이드 */}
                        {item.relatedGuides && item.relatedGuides.length > 0 && (
                          <Card className="border-primary/20">
                            <CardHeader>
                              <CardTitle className="text-base">관련 가이드</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {item.relatedGuides.map((relatedId) => {
                                  const relatedGuide = GUIDE_DATA.items.find(
                                    (g) => g.id === relatedId
                                  );
                                  if (!relatedGuide) return null;
                                  return (
                                    <Button
                                      key={relatedId}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedGuideId(relatedId);
                                        setTimeout(() => {
                                          const element = document.getElementById(
                                            `guide-${relatedId}`
                                          );
                                          if (element) {
                                            element.scrollIntoView({
                                              behavior: 'smooth',
                                              block: 'start',
                                            });
                                          }
                                        }, 100);
                                      }}
                                    >
                                      {relatedGuide.title}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
