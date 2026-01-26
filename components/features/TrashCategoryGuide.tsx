'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { TrashCategory } from '@/types';
import { Trash2, Apple, Recycle } from 'lucide-react';

interface TrashCategoryGuideProps {
  categories: TrashCategory[];
}

// 카테고리별 아이콘 및 색상
const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  'general': { icon: Trash2, color: 'text-brand-dark-muted', bgColor: 'bg-brand-cream/30' },
  'food-waste': { icon: Apple, color: 'text-status-success', bgColor: 'bg-status-success/10' },
  'recycling': { icon: Recycle, color: 'text-status-info', bgColor: 'bg-status-info/10' },
};

export function TrashCategoryGuide({ categories }: TrashCategoryGuideProps) {
  const [activeTab, setActiveTab] = useState(categories[0]?.id || 'general');

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4" role="region" aria-label="쓰레기 분류 가이드">
      {/* 핵심 안내 메시지 */}
      <div className="rounded-xl border border-status-info/30 bg-status-info/5 p-4">
        <p className="text-sm text-brand-dark font-medium text-center">
          <span className="font-semibold">분리수거</span>만 카페 1층 자판기 뒤에 배출해주세요
        </p>
        <p className="text-xs text-brand-dark-muted text-center mt-1">
          일반쓰레기와 음식물은 객실에 두셔도 됩니다
        </p>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-brand-cream/20 border border-brand-cream-dark/20 rounded-xl">
          {categories.map((category) => {
            const config = CATEGORY_CONFIG[category.id] || CATEGORY_CONFIG['general'];
            const Icon = config.icon;
            
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-xs font-medium",
                  "text-brand-dark-muted data-[state=active]:text-brand-dark",
                  "data-[state=active]:bg-white data-[state=active]:shadow-soft-sm rounded-lg"
                )}
              >
                <Icon className={cn("h-4 w-4", activeTab === category.id && config.color)} />
                <span>{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => {
          const config = CATEGORY_CONFIG[category.id] || CATEGORY_CONFIG['general'];
          
          return (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              <Card variant="info" className="border-brand-cream-dark/25">
                <CardHeader className="pb-3">
                  <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full", config.bgColor)}>
                    <config.icon className={cn("h-4 w-4", config.color)} />
                    <span className={cn("text-sm font-semibold", config.color.replace('text-', 'text-brand-dark'))}>{category.description}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-brand-dark-muted mb-2">포함 품목:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {category.examples.map((example, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-brand-cream/15 border border-brand-cream-dark/15"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-cream-dark/40 shrink-0" />
                          <span className="text-sm text-brand-dark">{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
