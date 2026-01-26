'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertTriangle, Shield, Wrench, Phone, Power, Fuel, Flame, Settings, Sparkles, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// 스텝 아이콘 매핑
const STEP_ICONS: Record<number, React.ElementType> = {
  1: Power,
  2: Fuel,
  3: Flame,
  4: Settings,
  5: Sparkles,
  6: PowerOff,
};

// 가이드 스텝 데이터
const BBQ_GUIDE_STEPS = [
  {
    id: 1,
    title: '전원 확인',
    description: '전원 스트립의 스위치를 ON으로 설정하세요.',
    warning: null,
  },
  {
    id: 2,
    title: '가스 레버 확인',
    description: '가스 탱크의 레버가 열려있는지 확인하세요.',
    warning: null,
  },
  {
    id: 3,
    title: '점화',
    description: '점화 버튼을 누르고 90도 천천히 회전하세요.',
    warning: '급격한 회전은 위험해요. 천천히 돌려주세요.',
  },
  {
    id: 4,
    title: '불꽃 조절',
    description: '원하는 불꽃 세기로 조절하세요.',
    warning: null,
  },
  {
    id: 5,
    title: '즐기기',
    description: '안전하게 캠프파이어를 즐기세요!',
    warning: null,
  },
  {
    id: 6,
    title: '소화',
    description: '사용 후 반드시 가스 레버를 잠그세요.',
    warning: '불씨가 완전히 꺼졌는지 확인하세요.',
  },
];

// 안전 수칙
const BBQ_SAFETY_RULES = [
  {
    id: 'before',
    title: '점화 전 확인사항',
    items: [
      '주변에 인화성 물질이 없는지 확인',
      '바람 방향 확인 (강풍 시 사용 자제)',
      '소화기 위치 확인',
    ],
  },
  {
    id: 'during',
    title: '사용 중 주의사항',
    items: [
      '어린이 접근 주의',
      '불 옆에서 자리 비우지 않기',
      '술에 취한 상태로 조작 금지',
    ],
  },
  {
    id: 'after',
    title: '소화 방법',
    items: [
      '가스 밸브 먼저 잠그기',
      '불씨 완전 소화 확인',
      '재 처리는 식은 후 다음날',
    ],
  },
];

// 트러블슈팅
const BBQ_TROUBLESHOOTING = [
  {
    id: 'no-fire',
    question: '불이 안 켜져요',
    answer: '1. 가스 밸브가 열려있는지 확인해주세요.\n2. 전원이 켜져있는지 확인해주세요.\n3. 점화 버튼을 누른 상태에서 천천히 회전해주세요.',
  },
  {
    id: 'no-control',
    question: '불꽃 조절이 안 돼요',
    answer: '조절 다이얼이 끝까지 돌아갔는지 확인해주세요. 그래도 안 되면 프론트로 연락주세요.',
  },
];

export function BBQGuideTab() {
  const [currentStep, setCurrentStep] = useState(0);

  const goToStep = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (direction === 'next' && currentStep < BBQ_GUIDE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const step = BBQ_GUIDE_STEPS[currentStep];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-lg font-semibold text-brand-dark tracking-tight">불멍/바베큐 시작하기</h2>
        <p className="text-sm text-muted-foreground mt-1">
          안전하고 즐거운 캠프파이어를 위해
        </p>
      </div>

      {/* 스텝 가이드 */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* 진행률 표시 */}
          <div className="px-5 pt-5">
            <div className="flex items-center gap-1">
              {BBQ_GUIDE_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-brand-dark' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {currentStep + 1} / {BBQ_GUIDE_STEPS.length}
            </p>
          </div>

          {/* 스텝 컨텐츠 */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                {/* 아이콘 */}
                {(() => {
                  const StepIcon = STEP_ICONS[step.id] || Flame;
                  return (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
                      <StepIcon className="h-8 w-8 text-amber-600" />
                    </div>
                  );
                })()}

                {/* 스텝 번호 + 타이틀 */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 rounded-full bg-brand-cream/50 text-brand-dark-muted text-xs font-semibold mb-2">
                    Step {step.id}
                  </span>
                  <h3 className="text-xl font-semibold text-brand-dark">
                    {step.title}
                  </h3>
                </div>

                {/* 설명 */}
                <p className="text-brand-dark-muted leading-relaxed">
                  {step.description}
                </p>

                {/* 경고 메시지 */}
                {step.warning && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-left">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{step.warning}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex items-center justify-between px-5 pb-5">
            <Button
              variant="outline"
              onClick={() => goToStep('prev')}
              disabled={currentStep === 0}
              className="gap-1 border-brand-cream-dark/30"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
            <Button
              onClick={() => goToStep('next')}
              disabled={currentStep === BBQ_GUIDE_STEPS.length - 1}
              className="gap-1 bg-brand-dark hover:bg-brand-dark/90"
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 안전 수칙 */}
      <section>
        <h3 className="text-sm font-semibold text-brand-dark mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-brand-dark-muted" />
          안전 수칙
        </h3>
        <Accordion type="single" collapsible className="space-y-2">
          {BBQ_SAFETY_RULES.map((rule) => (
            <AccordionItem
              key={rule.id}
              value={rule.id}
              className="border border-brand-cream-dark/25 rounded-xl px-4 bg-white"
            >
              <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline text-brand-dark">
                {rule.title}
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <ul className="space-y-2">
                  {rule.items.map((item, index) => (
                    <li key={index} className="text-sm text-brand-dark-muted flex items-start gap-2">
                      <span className="text-brand-dark-faint mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* 문제 해결 */}
      <section>
        <h3 className="text-sm font-semibold text-brand-dark mb-3 flex items-center gap-2">
          <Wrench className="h-4 w-4 text-brand-dark-muted" />
          문제 해결
        </h3>
        <Accordion type="single" collapsible className="space-y-2">
          {BBQ_TROUBLESHOOTING.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border border-brand-cream-dark/25 rounded-xl px-4 bg-white"
            >
              <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline text-brand-dark">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <p className="text-sm text-brand-dark-muted whitespace-pre-line">
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* 문의 안내 */}
        <div className="mt-4 p-4 rounded-xl bg-brand-cream/30 border border-brand-cream-dark/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-cream/50 border border-brand-cream-dark/15 flex items-center justify-center">
              <Phone className="h-5 w-5 text-brand-dark-soft" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-dark">계속 문제가 있으신가요?</p>
              <p className="text-xs text-brand-dark-muted">프론트로 연락해주세요</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
