'use client';

import { motion } from 'framer-motion';
import { Flame, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SetItem {
  name: string;
}

interface BBQSetCardProps {
  id: string;
  type: 'bbq' | 'fire';
  name: string;
  price: number;
  items: SetItem[];
  notice: string;
  onOrder: () => void;
  index?: number;
}

export function BBQSetCard({
  id,
  type,
  name,
  price,
  items,
  notice,
  onOrder,
  index = 0,
}: BBQSetCardProps) {
  const Icon = type === 'bbq' ? Flame : Moon;
  const accentColor = type === 'bbq' ? 'bg-amber-500' : 'bg-indigo-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div className="relative bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
        {/* 상단 악센트 라인 */}
        <div className={`absolute top-0 left-6 right-6 h-[2px] ${accentColor} rounded-full`} />
        
        {/* 메인 콘텐츠 */}
        <div className="flex items-start justify-between gap-4">
          {/* 좌측: 정보 */}
          <div className="flex-1 min-w-0">
            {/* 세트명 */}
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${type === 'bbq' ? 'text-amber-500' : 'text-indigo-400'}`} />
              <h3 className="font-bold text-lg text-neutral-900">{name}</h3>
            </div>
            
            {/* 구성품 */}
            <p className="text-sm text-neutral-500 mb-3">
              {items.map((item) => item.name).join(' · ')}
            </p>
            
            {/* 안내 */}
            <p className="text-xs text-neutral-400 italic">
              {notice}
            </p>
          </div>

          {/* 우측: 가격 + CTA */}
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-neutral-900 mb-3">
              {price.toLocaleString()}
              <span className="text-sm font-normal text-neutral-400 ml-0.5">원</span>
            </p>
            <Button
              onClick={onOrder}
              className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 px-6 text-sm font-medium"
            >
              주문하기
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
