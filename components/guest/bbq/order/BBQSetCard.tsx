'use client';

import { motion } from 'framer-motion';
import { Flame, Moon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
  const iconBgClass = type === 'bbq' 
    ? 'bg-orange-100/70' 
    : 'bg-indigo-100/70';
  const iconColorClass = type === 'bbq' ? 'text-orange-600' : 'text-indigo-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card 
        className="overflow-hidden border-border/50 hover:border-brand-dark/20 hover:shadow-md transition-all duration-300 group"
      >
        <CardContent className="p-5">
          {/* 헤더 영역 */}
          <div className="flex items-start gap-3">
            {/* 아이콘 */}
            <div className={`w-10 h-10 rounded-lg ${iconBgClass} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${iconColorClass}`} />
            </div>

            {/* 타이틀 + 구성품 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-brand-dark tracking-tight">{name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {items.map((item) => item.name).join(' · ')}
              </p>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>{notice}</span>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-border/50 my-4" />

          {/* 하단: 가격 + CTA */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-semibold text-brand-dark">
                ₩{price.toLocaleString()}
              </span>
            </div>
            <Button
              onClick={onOrder}
              className="rounded-lg bg-brand-dark text-white hover:bg-brand-dark/90 shadow-sm px-5"
            >
              주문하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
