'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import type { GuideStep } from '@/types';

interface StepByStepGuideProps {
  steps: GuideStep[];
  /** 모바일/인스펙터 용: 한 화면에 들어오도록 밀도 조정 */
  compact?: boolean;
}

export function StepByStepGuide({ steps, compact = false }: StepByStepGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrevious = currentStep > 0;

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'} role="region" aria-label="단계별 가이드">
      {/* 진행률 표시 */}
      <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            단계 {currentStep + 1} / {steps.length}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}% 진행</span>
        </div>
        <div className={compact ? 'h-1.5 w-full overflow-hidden rounded-full bg-muted' : 'h-2 w-full overflow-hidden rounded-full bg-muted'}>
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`진행률 ${Math.round(progress)}%`}
          />
        </div>
      </div>

      {/* 현재 단계 카드 */}
      <Card className="overflow-hidden">
        <CardContent className={compact ? 'p-4' : 'p-6'}>
          <div className={compact ? 'space-y-3' : 'space-y-4'}>
            {/* 단계 헤더 */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-semibold">
                    STEP {step.number}
                  </Badge>
                </div>
                <h3 className={compact ? 'text-lg font-bold text-foreground' : 'text-xl font-bold text-foreground'}>
                  {step.title}
                </h3>
              </div>
            </div>

            {/* 이미지 */}
            {step.image && (
              <div className={compact ? 'relative h-32 w-full overflow-hidden rounded-lg bg-muted' : 'relative h-48 w-full overflow-hidden rounded-lg bg-muted'}>
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `
                        <div class="flex h-full items-center justify-center bg-muted">
                          <span class="text-muted-foreground text-sm font-medium">${step.title}</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            )}

            {/* 설명 */}
            <p className={compact ? 'text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap' : 'text-muted-foreground leading-relaxed whitespace-pre-wrap'}>
              {step.description}
            </p>

            {/* 경고 */}
            {step.warning && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{step.warning}</p>
              </div>
            )}

            {/* 예상 소요 시간 */}
            {step.estimatedTime && (
              <div className={compact ? 'text-[11px] text-muted-foreground' : 'text-xs text-muted-foreground'}>
                ⏱️ 예상 소요 시간: {step.estimatedTime}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 네비게이션 버튼 */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          aria-label="이전 단계"
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          이전
        </Button>
        <div className="flex gap-1">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30'
              }`}
              aria-label={`${index + 1}단계로 이동`}
            />
          ))}
        </div>
        <Button
          variant="default"
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label="다음 단계"
          className="flex-1"
        >
          다음
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
