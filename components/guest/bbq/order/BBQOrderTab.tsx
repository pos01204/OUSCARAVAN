'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BBQHero } from './BBQHero';
import { BBQSetCard } from './BBQSetCard';
import { BBQOrderSheet } from './BBQOrderSheet';
import { useRouter } from 'next/navigation';

// 임시 상수 (나중에 lib/constants.ts로 이동)
const BBQ_SETS = [
  {
    id: 'bbq',
    type: 'bbq' as const,
    name: '바베큐 세트',
    price: 25000,
    items: [
      { name: '숯' },
      { name: '그릴' },
      { name: '토치' },
      { name: '집게' },
    ],
    notice: '식재료는 직접 준비해주세요',
  },
  {
    id: 'fire',
    type: 'fire' as const,
    name: '불멍 세트',
    price: 20000,
    items: [
      { name: '장작' },
      { name: '불쏘시개' },
      { name: '화로대' },
    ],
    notice: '마시멜로우 추천!',
  },
];

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
    <div className="space-y-6">
      {/* 히어로 섹션 - 캠프파이어 분위기 */}
      <BBQHero />

      {/* 세트 목록 */}
      <section className="-mx-4 px-4 py-6 bg-neutral-50 border-y border-neutral-200/60 space-y-4" aria-label="세트 메뉴">
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
      <section className="py-2">
        <div className="flex flex-col gap-3 text-sm text-neutral-500">
          <p>
            원하시는 시간에 카라반으로 배송해 드립니다.
          </p>
          <button
            onClick={onGuideClick}
            className="inline-flex items-center gap-1.5 text-neutral-700 font-medium hover:text-neutral-900 transition-colors self-start group"
          >
            처음이신가요? 사용 가이드 보기
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
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
