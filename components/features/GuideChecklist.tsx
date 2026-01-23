'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GuideChecklistItem } from '@/types';

interface GuideChecklistProps {
  items: GuideChecklistItem[];
  checklistId: string; // 가이드 ID를 기반으로 한 고유 ID
  onComplete?: (completedItems: string[]) => void;
  showProgress?: boolean;
  /** 기본 list. 모바일 인스펙터에서는 pager로 한 화면에 맞춤 */
  mode?: 'list' | 'pager';
  pageSize?: number;
}

export function GuideChecklist({
  items,
  checklistId,
  onComplete,
  showProgress = true,
  mode = 'list',
  pageSize = 4,
}: GuideChecklistProps) {
  const storageKey = `guide-checklist-${checklistId}`;

  // pager 모드 페이지 상태 (hooks는 조건 없이 항상 호출되어야 함)
  const [page, setPage] = useState(0);

  // 로컬 스토리지에서 완료 상태 불러오기
  const [completedItems, setCompletedItems] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 완료 상태를 로컬 스토리지에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(completedItems));
        onComplete?.(completedItems);
      } catch (error) {
        console.error('Failed to save checklist progress:', error);
      }
    }
  }, [completedItems, storageKey, onComplete]);

  const toggleItem = (itemId: string) => {
    setCompletedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const requiredItems = items.filter((item) => item.required);
  const completedRequired = requiredItems.filter((item) => completedItems.includes(item.id));
  const completedCount = completedItems.length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const requiredProgress =
    requiredItems.length > 0 ? (completedRequired.length / requiredItems.length) * 100 : 0;

  if (items.length === 0) {
    return null;
  }

  // pager 모드: 한 화면에 pageSize개만 표시
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const pagedItems =
    mode === 'pager' ? items.slice(safePage * pageSize, safePage * pageSize + pageSize) : items;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">체크리스트</CardTitle>
          {showProgress && (
            <Badge variant="secondary" className="font-semibold">
              {completedCount} / {totalCount}
            </Badge>
          )}
        </div>
        {showProgress && (
          <div className="space-y-2 mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`체크리스트 진행률 ${Math.round(progress)}%`}
              />
            </div>
            {requiredItems.length > 0 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>필수 항목: {completedRequired.length} / {requiredItems.length}</span>
                <span className="text-primary font-medium">
                  {Math.round(requiredProgress)}% 완료
                </span>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {mode === 'pager' && totalPages > 1 && (
          <div className="flex items-center justify-between gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="h-8"
            >
              이전
            </Button>
            <span className="text-xs text-muted-foreground">
              {safePage + 1} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="default"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              className="h-8"
            >
              다음
            </Button>
          </div>
        )}

        {pagedItems.map((item) => {
          const isCompleted = completedItems.includes(item.id);
          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50 ${
                isCompleted
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                  : 'bg-background border-border'
              } ${item.required ? 'border-l-4 border-l-primary' : ''}`}
              onClick={() => toggleItem(item.id)}
              role="checkbox"
              aria-checked={isCompleted}
              aria-label={item.text}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleItem(item.id);
                }
              }}
            >
              <div className="shrink-0 mt-0.5">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`font-medium ${
                      isCompleted
                        ? 'text-green-700 dark:text-green-300 line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {item.text}
                  </p>
                  {item.required && (
                    <Badge variant="destructive" className="text-xs">
                      필수
                    </Badge>
                  )}
                  {item.helpText && (
                    <button
                      type="button"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(item.helpText);
                      }}
                      aria-label={`${item.text} 도움말: ${item.helpText}`}
                      title={item.helpText}
                    >
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {item.category && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.category === 'checkin' && '체크인'}
                    {item.category === 'checkout' && '체크아웃'}
                    {item.category === 'facility' && '시설 점검'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
