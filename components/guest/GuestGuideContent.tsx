'use client';

import { useState, useMemo } from 'react';
import { Search, AlertCircle, Lightbulb, ExternalLink } from 'lucide-react';
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
import { TrashCategoryGuide } from '@/components/features/TrashCategoryGuide';
import Image from 'next/image';
import type { GuideItem } from '@/types';
import { GuestPageHeader } from '@/components/guest/GuestPageHeader';
import { InfoInspector } from '@/components/guest/InfoInspector';

interface GuestGuideContentProps {
  token?: string;
}

export function GuestGuideContent({ token }: GuestGuideContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [showBBQCarousel, setShowBBQCarousel] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [openInspector, setOpenInspector] = useState(false);

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
    setSelectedGuideId(guideId);
    setOpenInspector(true);
  };

  // BBQ 가이드가 선택된 경우
  const bbqGuide = GUIDE_DATA.items.find((item) => item.id === 'bbq');
  const inspectorDefaultTab = useMemo(() => {
    if (!selectedGuide) return 'steps';
    if (selectedGuide.steps && selectedGuide.steps.length > 0) return 'steps';
    if (selectedGuide.checklist && selectedGuide.checklist.length > 0) return 'checklist';
    if (selectedGuide.faq && selectedGuide.faq.length > 0) return 'faq';
    if (selectedGuide.troubleshooting && selectedGuide.troubleshooting.length > 0) return 'troubleshooting';
    return 'steps';
  }, [selectedGuide]);

  return (
    <main className="space-y-6" role="main" aria-label="안내 페이지">
      <GuestPageHeader
        title="이용 안내서"
        description="숙박 이용에 필요한 모든 정보를 확인하세요"
      />

      {/* 검색 및 필터 */}
      <section className="space-y-4" aria-label="검색 및 필터">
        {/* 카테고리 필터 */}
        <div
          className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 [-webkit-overflow-scrolling:touch]"
          role="tablist"
          aria-label="카테고리 필터"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
              role="tab"
              aria-selected={selectedCategory === category}
              aria-controls={`category-${category}`}
              className="shrink-0"
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
        <div id="guide-bbq" className="scroll-mt-24">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              {/* BBQ 미니 요약 (진입 전 기대치/준비물 안내) */}
              <div className="mb-3 rounded-lg border border-primary/20 bg-background/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">불멍/바베큐 시작 전</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      준비 시간과 준비물을 먼저 확인하면 더 빠르게 진행할 수 있어요.
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    약 5분
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">집게/가위</Badge>
                  <Badge variant="secondary" className="text-xs">장갑</Badge>
                  <Badge variant="secondary" className="text-xs">고기/식재료</Badge>
                  <Badge variant="secondary" className="text-xs">물티슈(추천)</Badge>
                </div>
              </div>
              <Button
                onClick={() => setShowBBQCarousel(!showBBQCarousel)}
                variant="default"
                className="w-full h-12 text-base font-semibold"
                aria-label="BBQ 가이드 캐러셀 열기/닫기"
              >
                {showBBQCarousel ? '일반 안내 보기' : '🔥 불멍/바베큐 가이드 보기'}
              </Button>
            </CardContent>
          </Card>
        </div>
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
                // 불멍/바베큐 가이드는 상단 고정 섹션(캐러셀 진입)으로 제공하므로
                // 목록에서는 중복 노출을 방지하기 위해 숨깁니다.
                if (item.id === 'bbq') return null;
                return (
                  <div key={item.id} id={`guide-${item.id}`}>
                    {/* 가이드 카드 */}
                    <Card
                      className="transition-all cursor-pointer hover:shadow-lg hover:border-primary/30 active:scale-[0.99]"
                      onClick={() => handleGuideClick(item.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${item.title} 상세 보기`}
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
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 상세 인스펙터 (모바일 Drawer / 데스크톱 Sheet) */}
      <InfoInspector
        open={openInspector}
        onOpenChange={(o) => {
          setOpenInspector(o);
          if (!o) setSelectedGuideId(null);
        }}
        title={selectedGuide?.title ?? '상세 안내'}
        description={selectedGuide?.overview}
        // 모바일에서 내용이 길어지면 Drawer가 화면을 넘기며 스크롤/드래그 충돌이 발생할 수 있어
        // 가이드 상세는 한 화면 구성(페이지네이션)으로 설계하고 Drawer 높이도 제한합니다.
        contentClassName="max-h-[92dvh] overflow-hidden md:max-w-xl"
      >
        {selectedGuide ? (
          <div className="space-y-3">
            {/* 상단: 핵심만 한 화면에 들어오도록 요약/주의/팁을 압축 */}
            {(selectedGuide.warning || (selectedGuide.tips && selectedGuide.tips.length > 0)) && (
              <Card className="border-border/60">
                <CardContent className="p-4 space-y-3">
                  {selectedGuide.warning && selectedGuide.warningText ? (
                    <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                      <AlertCircle className="h-5 w-5 text-yellow-700 shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-900">{selectedGuide.warningText}</p>
                    </div>
                  ) : null}

                  {selectedGuide.tips && selectedGuide.tips.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        유용한 팁
                      </p>
                      <ul className="space-y-1 pl-4">
                        {selectedGuide.tips.slice(0, 3).map((tip, index) => (
                          <li key={index} className="text-sm text-muted-foreground list-disc">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* 탭으로 구성된 상세 정보 */}
            {selectedGuide.id === 'trash' && selectedGuide.trashCategories ? (
              <div className="space-y-4">
                <TrashCategoryGuide categories={selectedGuide.trashCategories} />
                {selectedGuide.faq && selectedGuide.faq.length > 0 && (
                  <GuideFAQ faqs={selectedGuide.faq} searchable={true} />
                )}
              </div>
            ) : (
              <Tabs defaultValue={inspectorDefaultTab} className="w-full">
                <TabsList className="grid w-full grid-flow-col auto-cols-fr h-auto p-1.5 bg-muted/40 border border-border/50 rounded-xl shadow-sm">
                  {selectedGuide.steps && selectedGuide.steps.length > 0 && (
                    <TabsTrigger value="steps" className="text-xs py-2.5 font-bold">
                      단계별
                    </TabsTrigger>
                  )}
                  {selectedGuide.checklist && selectedGuide.checklist.length > 0 && (
                    <TabsTrigger value="checklist" className="text-xs py-2.5 font-bold">
                      체크
                    </TabsTrigger>
                  )}
                  {selectedGuide.faq && selectedGuide.faq.length > 0 && (
                    <TabsTrigger value="faq" className="text-xs py-2.5 font-bold">
                      FAQ
                    </TabsTrigger>
                  )}
                  {selectedGuide.troubleshooting && selectedGuide.troubleshooting.length > 0 && (
                    <TabsTrigger value="troubleshooting" className="text-xs py-2.5 font-bold">
                      해결
                    </TabsTrigger>
                  )}
                </TabsList>

                {selectedGuide.steps && selectedGuide.steps.length > 0 && (
                  <TabsContent value="steps" className="mt-4">
                    <StepByStepGuide steps={selectedGuide.steps} compact />
                  </TabsContent>
                )}

                {selectedGuide.checklist && selectedGuide.checklist.length > 0 && (
                  <TabsContent value="checklist" className="mt-4">
                    <GuideChecklist
                      items={selectedGuide.checklist}
                      checklistId={selectedGuide.id}
                      mode="pager"
                      pageSize={4}
                    />
                  </TabsContent>
                )}

                {selectedGuide.faq && selectedGuide.faq.length > 0 && (
                  <TabsContent value="faq" className="mt-4">
                    <GuideFAQ faqs={selectedGuide.faq} searchable={false} mode="pager" />
                  </TabsContent>
                )}

                {selectedGuide.troubleshooting && selectedGuide.troubleshooting.length > 0 && (
                  <TabsContent value="troubleshooting" className="mt-4">
                    <GuideTroubleshooting items={selectedGuide.troubleshooting} mode="pager" />
                  </TabsContent>
                )}
              </Tabs>
            )}

          </div>
        ) : null}
      </InfoInspector>
    </main>
  );
}
