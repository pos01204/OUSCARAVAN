'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  Lightbulb,
  Thermometer,
  Droplets,
  Wifi,
  Car,
  Trash2,
  Flame,
} from 'lucide-react';
import { 
  CaretRight, 
  WarningCircle,
} from '@phosphor-icons/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GUIDE_DATA, BBQ_GUIDE_SLIDES } from '@/lib/constants';
import { BBQCarousel } from '@/components/features/BBQCarousel';
import { StepByStepGuide } from '@/components/features/StepByStepGuide';
import { GuideChecklist } from '@/components/features/GuideChecklist';
import { GuideFAQ } from '@/components/features/GuideFAQ';
import { GuideTroubleshooting } from '@/components/features/GuideTroubleshooting';
import { TrashCategoryGuide } from '@/components/features/TrashCategoryGuide';
import { InfoInspector } from '@/components/guest/InfoInspector';
import { PageHeader } from '@/components/shared/PageHeader';
import { FadeInSection } from '@/components/shared/FadeInSection';
import { cn } from '@/lib/utils';
import { CARD_STAGGER } from '@/lib/motion';

// 가이드별 아이콘 매핑
const GUIDE_ICONS: Record<string, React.ElementType> = {
  'heating': Thermometer,
  'hot-water': Droplets,
  'wifi': Wifi,
  'parking': Car,
  'trash': Trash2,
  'bbq': Flame,
};

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

  // Inspector 기본 탭 결정
  const inspectorDefaultTab = useMemo(() => {
    if (!selectedGuide) return 'steps';
    if (selectedGuide.steps && selectedGuide.steps.length > 0) return 'steps';
    if (selectedGuide.checklist && selectedGuide.checklist.length > 0) return 'checklist';
    if (selectedGuide.faq && selectedGuide.faq.length > 0) return 'faq';
    if (selectedGuide.troubleshooting && selectedGuide.troubleshooting.length > 0) return 'troubleshooting';
    return 'steps';
  }, [selectedGuide]);

  return (
    <main role="main" aria-label="안내 페이지" className="pb-24">
      {/* 공통 헤더 */}
      <PageHeader 
        subtitle="GUIDE"
        title="이용 안내" 
      />

      {/* 카테고리 필터 - 모바일 최적화 pill 스타일 */}
      <nav aria-label="카테고리 필터" className="mb-5">
        <div
          className="flex gap-2 overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch] pb-1"
          role="tablist"
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                role="tab"
                aria-selected={isSelected}
                className={cn(
                  // 모바일 터치 타겟: 최소 44px
                  "shrink-0 px-4 py-2.5 min-h-[44px] text-sm rounded-full transition-all duration-200 font-medium",
                  isSelected
                    ? "bg-brand-dark text-white"
                    : "bg-brand-cream/40 text-brand-dark-muted active:bg-brand-cream/60"
                )}
              >
                {category}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 컨텐츠 영역 */}
      <FadeInSection className="space-y-1.5">
        {showBBQCarousel ? (
          <section aria-label="BBQ 가이드 캐러셀">
            <BBQCarousel slides={BBQ_GUIDE_SLIDES} onClose={() => setShowBBQCarousel(false)} />
          </section>
        ) : (
          <motion.section 
            aria-label="가이드 목록"
            variants={CARD_STAGGER.container}
            initial="hidden"
            animate="show"
          >
            {filteredGuideData.length === 0 ? (
              /* 빈 상태 - 미니멀 */
              <div className="py-12 text-center">
                <p className="text-sm text-brand-dark-muted">
                  해당 카테고리에 안내가 없습니다.
                </p>
                <button
                  onClick={() => setSelectedCategory('전체')}
                  className="mt-3 text-sm font-medium text-brand-dark underline underline-offset-2"
                >
                  전체 보기
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGuideData.map((item, index) => {
                  // BBQ 가이드는 캐러셀로 열기
                  const isBBQ = item.id === 'bbq';
                  const Icon = GUIDE_ICONS[item.id];
                  
                  return (
                    <motion.button
                      key={item.id}
                      variants={CARD_STAGGER.item}
                      onClick={() => isBBQ ? setShowBBQCarousel(true) : handleGuideClick(item.id)}
                      id={`guide-${item.id}`}
                      className="
                        w-full text-left
                        flex items-center gap-3
                        min-h-[60px] px-4 py-3
                        rounded-xl border border-brand-cream-dark/25 bg-white
                        shadow-soft-sm hover:shadow-soft-md
                        active:bg-brand-cream/20
                        transition-all duration-200
                        group
                      "
                      aria-label={`${item.title} 상세 보기`}
                    >
                      {/* 아이콘 */}
                      <div className="w-9 h-9 rounded-lg bg-brand-cream/30 border border-brand-cream-dark/15 flex items-center justify-center shrink-0">
                        {Icon ? (
                          <Icon className="h-4 w-4 text-brand-dark-soft" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-cream-dark/50" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-brand-dark">
                            {item.title}
                          </span>
                          {item.warning && (
                            <WarningCircle 
                              size={13} 
                              weight="fill" 
                              className="text-status-warning shrink-0" 
                            />
                          )}
                        </div>
                        {item.overview && (
                          <p className="text-xs text-brand-dark-muted mt-0.5 line-clamp-1">
                            {item.overview}
                          </p>
                        )}
                      </div>
                      
                      <CaretRight
                        size={16}
                        weight="bold"
                        className="text-brand-dark-faint group-hover:text-brand-dark-muted shrink-0 transition-colors"
                      />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.section>
        )}
      </FadeInSection>

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
            {/* 상단: 핵심만 한 화면에 들어오도록 요약/주의/팁을 압축 - 브랜드 톤 */}
            {(selectedGuide.warning || (selectedGuide.tips && selectedGuide.tips.length > 0)) && (
              <div className="rounded-xl border border-brand-cream-dark/25 bg-brand-cream/15 p-4 space-y-3">
                {selectedGuide.warning && selectedGuide.warningText ? (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-brand-dark-muted shrink-0 mt-0.5" />
                    <p className="text-sm text-brand-dark-soft">{selectedGuide.warningText}</p>
                  </div>
                ) : null}

                {selectedGuide.tips && selectedGuide.tips.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-brand-dark flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-brand-dark-muted" />
                      유용한 팁
                    </p>
                    <ul className="space-y-1 pl-6">
                      {selectedGuide.tips.slice(0, 3).map((tip, index) => (
                        <li key={index} className="text-sm text-brand-dark-muted list-disc">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}

            {/* 탭으로 구성된 상세 정보 - 모바일 최적화 */}
            {selectedGuide.id === 'trash' && selectedGuide.trashCategories ? (
              <div className="space-y-4">
                <TrashCategoryGuide categories={selectedGuide.trashCategories} />
                {selectedGuide.faq && selectedGuide.faq.length > 0 && (
                  <GuideFAQ faqs={selectedGuide.faq} searchable={true} />
                )}
              </div>
            ) : (() => {
              // 가용 탭 개수 계산
              const availableTabs = [
                selectedGuide.steps && selectedGuide.steps.length > 0,
                selectedGuide.checklist && selectedGuide.checklist.length > 0,
                selectedGuide.faq && selectedGuide.faq.length > 0,
                selectedGuide.troubleshooting && selectedGuide.troubleshooting.length > 0,
              ].filter(Boolean).length;

              // 콘텐츠가 없는 경우 (주차 안내 등)
              if (availableTabs === 0) {
                return null;
              }

              // 단일 탭: 탭 UI 없이 콘텐츠만 직접 표시
              if (availableTabs === 1) {
                if (selectedGuide.steps && selectedGuide.steps.length > 0) {
                  return <StepByStepGuide steps={selectedGuide.steps} compact />;
                }
                if (selectedGuide.checklist && selectedGuide.checklist.length > 0) {
                  return (
                    <GuideChecklist
                      items={selectedGuide.checklist}
                      checklistId={selectedGuide.id}
                      mode="pager"
                      pageSize={4}
                    />
                  );
                }
                if (selectedGuide.faq && selectedGuide.faq.length > 0) {
                  return <GuideFAQ faqs={selectedGuide.faq} searchable={false} mode="pager" />;
                }
                if (selectedGuide.troubleshooting && selectedGuide.troubleshooting.length > 0) {
                  return <GuideTroubleshooting items={selectedGuide.troubleshooting} mode="pager" />;
                }
                return null;
              }

              // 다중 탭: 기존 탭 UI 표시
              return (
                <Tabs defaultValue={inspectorDefaultTab} className="w-full">
                  {/* 탭 리스트 - 아이콘 제거, 텍스트만, 터치 타겟 확보 */}
                  <TabsList className="grid w-full grid-flow-col auto-cols-fr h-auto p-1 bg-brand-cream/20 border border-brand-cream-dark/20 rounded-xl">
                    {selectedGuide.steps && selectedGuide.steps.length > 0 && (
                      <TabsTrigger 
                        value="steps" 
                        className="text-xs py-3 font-medium text-brand-dark-muted data-[state=active]:text-brand-dark data-[state=active]:bg-white data-[state=active]:shadow-soft-sm rounded-lg"
                      >
                        단계별
                      </TabsTrigger>
                    )}
                    {selectedGuide.checklist && selectedGuide.checklist.length > 0 && (
                      <TabsTrigger 
                        value="checklist" 
                        className="text-xs py-3 font-medium text-brand-dark-muted data-[state=active]:text-brand-dark data-[state=active]:bg-white data-[state=active]:shadow-soft-sm rounded-lg"
                      >
                        체크
                      </TabsTrigger>
                    )}
                    {selectedGuide.faq && selectedGuide.faq.length > 0 && (
                      <TabsTrigger 
                        value="faq" 
                        className="text-xs py-3 font-medium text-brand-dark-muted data-[state=active]:text-brand-dark data-[state=active]:bg-white data-[state=active]:shadow-soft-sm rounded-lg"
                      >
                        FAQ
                      </TabsTrigger>
                    )}
                    {selectedGuide.troubleshooting && selectedGuide.troubleshooting.length > 0 && (
                      <TabsTrigger 
                        value="troubleshooting" 
                        className="text-xs py-3 font-medium text-brand-dark-muted data-[state=active]:text-brand-dark data-[state=active]:bg-white data-[state=active]:shadow-soft-sm rounded-lg"
                      >
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
              );
            })()}

          </div>
        ) : null}
      </InfoInspector>
    </main>
  );
}
