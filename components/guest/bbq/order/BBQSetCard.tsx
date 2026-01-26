'use client';

import { motion } from 'framer-motion';
import { Flame, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BBQSetCardProps {
  id: string;
  type: 'bbq' | 'fire';
  name: string;
  price: number;
  notice: string;
  onOrder: () => void;
  index?: number;
}

export function BBQSetCard({
  id,
  type,
  name,
  price,
  notice,
  onOrder,
  index = 0,
}: BBQSetCardProps) {
  const Icon = type === 'bbq' ? Flame : Moon;
  const accentColor = type === 'bbq' ? 'bg-amber-500' : 'bg-indigo-400';
  const iconColor = type === 'bbq' ? 'text-amber-500' : 'text-indigo-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div className="relative bg-white rounded-2xl border border-brand-cream-dark/30 p-5 shadow-soft-sm hover:shadow-soft-md transition-shadow">
        {/* 상단 악센트 라인 */}
        <div className={`absolute top-0 left-6 right-6 h-[2px] ${accentColor} rounded-full`} />
        
        {/* 메인 콘텐츠 */}
        <div className="flex items-center justify-between gap-4">
          {/* 좌측: 정보 */}
          <div className="flex-1 min-w-0">
            {/* 세트명 */}
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`w-8 h-8 rounded-lg ${type === 'bbq' ? 'bg-amber-50' : 'bg-indigo-50'} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <h3 className="font-bold text-lg text-brand-dark">{name}</h3>
            </div>
            
            {/* 안내 */}
            <p className="text-xs text-brand-dark-muted pl-[42px]">
              {notice}
            </p>
          </div>

          {/* 우측: 가격 + CTA */}
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-brand-dark mb-2">
              {price.toLocaleString()}
              <span className="text-sm font-normal text-brand-dark-muted ml-0.5">원</span>
            </p>
            <Button
              onClick={onOrder}
              className="rounded-full bg-brand-dark text-white hover:bg-brand-dark/90 px-6 text-sm font-medium"
            >
              주문하기
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
