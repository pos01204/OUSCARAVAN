'use client';

import { useState } from 'react';
import { CaretRight } from '@phosphor-icons/react';
import { Truck, HelpCircle } from 'lucide-react';
import { BBQHero } from './BBQHero';
import { BBQSetCard } from './BBQSetCard';
import { BBQOrderSheet } from './BBQOrderSheet';
import { BBQ_SETS } from '@/lib/constants';
import { useRouter } from 'next/navigation';

interface BBQOrderTabProps {
  token: string;
  onGuideClick?: () => void;
}

export function BBQOrderTab({ token, onGuideClick }: BBQOrderTabProps) {
  const router = useRouter();
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<typeof BBQ_SETS[0] | null>(null);

  const handleOrder = (set: typeof BBQ_SETS[0]) => {
    setSelectedSet(set);
    setOrderSheetOpen(true);
  };

  const handleOrderSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* 히어로 섹션 - 축소된 버전 */}
      <BBQHero />

      {/* 세트 목록 - 더 강조 */}
      <section className="space-y-3" aria-label="세트 메뉴">
        {BBQ_SETS.map((set, index) => (
          <BBQSetCard
            key={set.id}
            {...set}
            index={index}
            onOrder={() => handleOrder(set)}
          />
        ))}
      </section>

      {/* 이용 안내 */}
      <section className="space-y-2.5">
        {/* 배송 안내 */}
        <div className="rounded-xl bg-brand-cream/30 border border-brand-cream-dark/20 p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-cream/50 border border-brand-cream-dark/15 flex items-center justify-center shrink-0">
              <Truck className="h-4 w-4 text-brand-dark-soft" />
            </div>
            <div>
              <p className="font-semibold text-brand-dark text-sm mb-0.5">배송 안내</p>
              <p className="text-sm text-brand-dark-muted leading-relaxed">
                원하시는 시간에 카라반으로 배송해 드립니다.
              </p>
            </div>
          </div>
        </div>

        {/* 사용 가이드 - subtle 스타일 */}
        <button
          onClick={onGuideClick}
          className="w-full rounded-xl bg-brand-cream/30 border border-brand-cream-dark/20 hover:bg-brand-cream/50 transition-colors p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-cream/50 border border-brand-cream-dark/15 flex items-center justify-center shrink-0">
                <HelpCircle className="h-4 w-4 text-brand-dark-soft" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-brand-dark text-sm">처음이신가요?</p>
                <p className="text-xs text-brand-dark-muted">사용 가이드 보기</p>
              </div>
            </div>
            <CaretRight size={16} weight="bold" className="text-brand-dark-muted" />
          </div>
        </button>
      </section>

      {/* 주문 시트 */}
      <BBQOrderSheet
        open={orderSheetOpen}
        onOpenChange={setOrderSheetOpen}
        selectedSet={selectedSet}
        token={token}
        onSuccess={handleOrderSuccess}
      />
    </div>
  );
}
