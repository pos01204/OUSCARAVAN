'use client';

import { useState, useMemo } from 'react';
import { 
  AlertCircle, 
  Lightbulb, 
  ChevronRight,
  Flame,
  MapPin,
  Droplets,
  Trash2,
  Snowflake,
  Clock,
  HelpCircle,
  ClipboardList,
  MessageCircleQuestion,
  Wrench,
  Search,
  type LucideIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GUIDE_DATA, BBQ_GUIDE_SLIDES } from '@/lib/constants';
import { BBQCarousel } from '@/components/features/BBQCarousel';
import { StepByStepGuide } from '@/components/features/StepByStepGuide';
import { GuideChecklist } from '@/components/features/GuideChecklist';
import { GuideFAQ } from '@/components/features/GuideFAQ';
import { GuideTroubleshooting } from '@/components/features/GuideTroubleshooting';
import { TrashCategoryGuide } from '@/components/features/TrashCategoryGuide';
import { GuestPageHeader } from '@/components/guest/GuestPageHeader';
import { InfoInspector } from '@/components/guest/InfoInspector';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';
import { cn } from '@/lib/utils';

// 카테고리별 아이콘 + 색상 + 이모지 매핑
type CategoryStyle = {
  icon: LucideIcon;
  tone: 'info' | 'teal' | 'purple' | 'orange' | 'success' | 'slate' | 'warning';
  emoji: string;
  activeColor: string; // 선택 시 배경색
};

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  '전체': { icon: HelpCircle, tone: 'slate', emoji: '📋', activeColor: 'bg-brand-dark' },
  '실내': { icon: MapPin, tone: 'info', emoji: '🏠', activeColor: 'bg-blue-600' },
  '편의시설': { icon: Droplets, tone: 'teal', emoji: '🚿', activeColor: 'bg-teal-600' },
  '규칙': { icon: Clock, tone: 'purple', emoji: '📌', activeColor: 'bg-purple-600' },
  '요리': { icon: Flame, tone: 'orange', emoji: '🍳', activeColor: 'bg-orange-500' },
  '쓰레기': { icon: Trash2, tone: 'success', emoji: '♻️', activeColor: 'bg-green-600' },
  '에어컨': { icon: Snowflake, tone: 'info', emoji: '❄️', activeColor: 'bg-sky-500' },
  '기타': { icon: HelpCircle, tone: 'slate', emoji: '💡', activeColor: 'bg-slate-600' },
};

const DEFAULT_STYLE: CategoryStyle = { icon: HelpCircle, tone: 'slate', emoji: '📄', activeColor: 'bg-slate-600' };

interface GuestGuideContentProps {
  token?: string;
}

export function GuestGuideContent({ token }: GuestGuideContentProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [showBBQCarousel, setShowBBQCarousel] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [openInspector, setOpenInspector] = useState(false);

  const categories = ['전체', ...new Set(GUIDE_DATA.items.map((item) => item.category))];

  // 카테고리 필터링
  const filteredGuideData = useMemo(() => {
    return GUIDE_DATA.items.filter((item) => {
      return selectedCategory === '전체' || item.category === selectedCategory;
    });
  }, [selectedCategory]);

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
    <main className="space-y-5" role="main" aria-label="안내 페이지">
      <GuestPageHeader
        title="이용 안내서"
        description="숙박 이용에 필요한 모든 정보를 확인하세요"
      />

      {/* 카테고리 칩 필터 */}
      <section aria-label="카테고리 필터">
        <div className="relative">
          <div
            className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-hide [-webkit-overflow-scrolling:touch]"
            role="tablist"
            aria-label="카테고리 필터"
          >
            {categories.map((category) => {
              const style = CATEGORY_STYLES[category] || DEFAULT_STYLE;
              const isSelected = selectedCategory === category;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  role="tab"
                  aria-selected={isSelected}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
                    isSelected
                      ? `${style.activeColor} text-white shadow-md ring-2 ring-offset-1 ring-offset-background`
                      : "bg-white text-muted-foreground hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm",
                    isSelected && style.activeColor === 'bg-brand-dark' && 'ring-brand-dark/30',
                    isSelected && style.activeColor === 'bg-blue-600' && 'ring-blue-300',
                    isSelected && style.activeColor === 'bg-teal-600' && 'ring-teal-300',
                    isSelected && style.activeColor === 'bg-purple-600' && 'ring-purple-300',
                    isSelected && style.activeColor === 'bg-orange-500' && 'ring-orange-300',
                    isSelected && style.activeColor === 'bg-green-600' && 'ring-green-300',
                    isSelected && style.activeColor === 'bg-sky-500' && 'ring-sky-300',
                    isSelected && style.activeColor === 'bg-slate-600' && 'ring-slate-300',
                  )}
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {style.emoji}
                  </span>
                  <span>{category}</span>
                </button>
              );
            })}
          </div>
          {/* 스크롤 힌트 - 더 부드러운 그라데이션 */}
          <div className="absolute right-0 top-1 bottom-3 w-12 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* BBQ 빠른 시작 섹션 */}
      {bbqGuide && (
        <GuestMotionCard motionMode="spring">
          <Card 
            variant="cta" 
            id="guide-bbq" 
            className="scroll-mt-24 overflow-hidden border-orange-200/50"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center shrink-0 shadow-sm">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-brand-dark leading-tight">불멍/바베큐 가이드</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    약 5분 · 집게 · 장갑 · 식재료
                  </p>
                </div>
                <Button
                  onClick={() => setShowBBQCarousel(!showBBQCarousel)}
                  size="sm"
                  className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                  aria-label="BBQ 가이드 캐러셀 열기/닫기"
                >
                  {showBBQCarousel ? '닫기' : '시작'}
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </GuestMotionCard>
      )}

      {/* 구분선 */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-xs text-muted-foreground/60 font-medium">안내 목록</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {showBBQCarousel ? (
        <section aria-label="BBQ 가이드 캐러셀">
          <BBQCarousel slides={BBQ_GUIDE_SLIDES} onClose={() => setShowBBQCarousel(false)} />
        </section>
      ) : (
        <section aria-label="가이드 목록">
          {filteredGuideData.length === 0 ? (
            /* 빈 상태 디자인 개선 */
            <Card variant="muted">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold text-brand-dark">해당 카테고리에 안내가 없어요</p>
                <p className="text-sm text-muted-foreground mt-1">
                  다른 카테고리를 선택해보세요
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSelectedCategory('전체')}
                >
                  전체 보기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredGuideData.map((item) => {
                // 불멍/바베큐 가이드는 상단 고정 섹션으로 제공
                if (item.id === 'bbq') return null;
                
                const categoryStyle = CATEGORY_STYLES[item.category] || DEFAULT_STYLE;
                const CategoryIcon = categoryStyle.icon;
                // 주의 항목은 warning 톤 우선 적용
                const iconTone = item.warning ? 'warning' : categoryStyle.tone;
                
                const contentTypes = [
                  item.steps && item.steps.length > 0 && '단계별',
                  item.checklist && item.checklist.length > 0 && '체크리스트',
                  item.faq && item.faq.length > 0 && 'FAQ',
                ].filter(Boolean).join(' · ');

                return (
                  <GuestMotionCard key={item.id} motionMode="spring">
                    <Card
                      interactive
                      variant="info"
                      id={`guide-${item.id}`}
                      className="cursor-pointer card-hover-glow group"
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
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {/* 카테고리 아이콘 배지 - 카테고리별 색상 적용 */}
                          <CardIconBadge 
                            icon={CategoryIcon} 
                            tone={iconTone}
                            size="md"
                          />
                          
                          <div className="flex-1 min-w-0">
                            {/* 타이틀 + 주의 배지 */}
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-brand-dark leading-tight">
                                {item.title}
                              </h3>
                              {item.warning && (
                                <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                                  주의
                                </span>
                              )}
                            </div>
                            
                            {/* 설명 */}
                            {item.overview && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                                {item.overview}
                              </p>
                            )}
                            
                            {/* 메타 정보 */}
                            {contentTypes && (
                              <p className="text-xs text-muted-foreground/70 mt-1.5">
                                {contentTypes}
                              </p>
                            )}
                          </div>
                          
                          {/* 화살표 힌트 */}
                          <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </GuestMotionCard>
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
              <Card variant="info">
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
                <TabsList className="grid w-full grid-flow-col auto-cols-fr h-auto p-1.5 bg-muted/40 border border-border/50 rounded-xl">
                  {selectedGuide.steps && selectedGuide.steps.length > 0 && (
                    <TabsTrigger value="steps" className="text-xs py-2.5 font-bold gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5" />
                      단계별
                    </TabsTrigger>
                  )}
                  {selectedGuide.checklist && selectedGuide.checklist.length > 0 && (
                    <TabsTrigger value="checklist" className="text-xs py-2.5 font-bold gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5" />
                      체크
                    </TabsTrigger>
                  )}
                  {selectedGuide.faq && selectedGuide.faq.length > 0 && (
                    <TabsTrigger value="faq" className="text-xs py-2.5 font-bold gap-1.5">
                      <MessageCircleQuestion className="h-3.5 w-3.5" />
                      FAQ
                    </TabsTrigger>
                  )}
                  {selectedGuide.troubleshooting && selectedGuide.troubleshooting.length > 0 && (
                    <TabsTrigger value="troubleshooting" className="text-xs py-2.5 font-bold gap-1.5">
                      <Wrench className="h-3.5 w-3.5" />
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
