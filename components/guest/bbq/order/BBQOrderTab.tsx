'use client';

import { useState } from 'react';
import { BookOpen, Info } from 'lucide-react';
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
      <section className="space-y-4" aria-label="세트 메뉴">
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
      <section className="rounded-xl bg-muted/20 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-brand-dark flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          이용 안내
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="shrink-0">•</span>
            <span>배송 시간을 선택하면 해당 시간에 카라반으로 배송해드려요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0">•</span>
            <span>
              사용법은{' '}
              <button
                onClick={onGuideClick}
                className="text-brand-dark font-medium underline underline-offset-2 hover:no-underline inline-flex items-center gap-1"
              >
                <BookOpen className="h-3.5 w-3.5" />
                사용 가이드
              </button>
              {' '}탭에서 확인할 수 있어요
            </span>
          </li>
        </ul>
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
