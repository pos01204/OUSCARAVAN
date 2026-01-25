'use client';

import { motion } from 'framer-motion';
import { Flame, Moon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SetItem {
  name: string;
  icon: string;
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
    ? 'bg-gradient-to-br from-orange-100 to-amber-50' 
    : 'bg-gradient-to-br from-indigo-100 to-purple-50';
  const iconColorClass = type === 'bbq' ? 'text-orange-500' : 'text-indigo-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card 
        className="overflow-hidden border-border/50 hover:border-brand-dark/20 hover:shadow-lg transition-all duration-300 group"
      >
        <CardContent className="p-5">
          {/* 헤더 영역 */}
          <div className="flex items-start gap-4">
            {/* 아이콘 */}
            <div className={`w-14 h-14 rounded-xl ${iconBgClass} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
              <Icon className={`h-7 w-7 ${iconColorClass}`} />
            </div>

            {/* 타이틀 + 구성품 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-brand-dark">{name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {items.map((item) => item.name).join(' · ')}
              </p>
            </div>
          </div>

          {/* 구성품 아이콘 */}
          <div className="flex items-center gap-3 mt-4 py-3 px-4 rounded-xl bg-background-muted/50">
            {items.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-lg" role="img" aria-label={item.name}>
                  {item.icon}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {item.name}
                </span>
              </div>
            ))}
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
              <span className="text-2xl font-bold text-brand-dark">
                ₩{price.toLocaleString()}
              </span>
            </div>
            <Button
              onClick={onOrder}
              className={type === 'bbq' 
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm' 
                : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm'
              }
            >
              주문하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
