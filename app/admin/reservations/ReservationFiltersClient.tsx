'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Search, Filter, X } from 'lucide-react';
import { sanitizeInput } from '@/lib/security';

interface ReservationFiltersClientProps {
  initialFilter?: string | null;
  initialView?: string | null;
  initialCheckin?: string | null;
}

export function ReservationFiltersClient({
  initialFilter,
  initialView,
  initialCheckin,
}: ReservationFiltersClientProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // 서버에서 전달된 초기값 또는 searchParams 사용
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [checkin, setCheckin] = useState(
    initialCheckin || searchParams.get('checkin') || ''
  );
  const [checkout, setCheckout] = useState(searchParams.get('checkout') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  // 초기 필터 적용 (서버에서 전달된 경우)
  useEffect(() => {
    if (initialCheckin) {
      setCheckin(initialCheckin);
    }
  }, [initialCheckin, setCheckin]);

  // 활성 필터 확인
  const hasActiveFilters = status !== 'all' || checkin || checkout || search;

  const handleFilterChange = () => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.set('status', status);
      if (checkin) params.set('checkin', checkin);
      if (checkout) params.set('checkout', checkout);
      if (search) {
        // 검색어 정리 (보안)
        const sanitizedSearch = sanitizeInput(search, { maxLength: 100 });
        params.set('search', sanitizedSearch);
      }

      router.push(`/admin/reservations?${params.toString()}`);
      setIsSheetOpen(false); // 모바일 시트 닫기
    });
  };

  const handleReset = () => {
    setStatus('all');
    setCheckin('');
    setCheckout('');
    setSearch('');
    startTransition(() => {
      router.push('/admin/reservations');
    });
  };

  return (
    <div className="mb-4">
      {/* 빠른 필터 (항상 표시 - 가로 스크롤) */}
      <div className="flex overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide gap-2 mb-2">
        <Button
          variant={checkin && !checkout ? "default" : "outline"}
          size="sm"
          className={`min-h-[38px] px-4 rounded-full whitespace-nowrap flex-shrink-0 transition-all font-semibold ${checkin && !checkout ? "shadow-md scale-105" : "hover:bg-muted/80 shadow-sm"
            }`}
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            if (checkin === today && !checkout) {
              handleReset();
            } else {
              setCheckin(today);
              setCheckout('');
              setStatus('all');
              setSearch('');
              startTransition(() => {
                router.push(`/admin/reservations?checkin=${today}`);
              });
            }
          }}
        >
          {checkin && !checkout ? "✓ 오늘 체크인" : "오늘 체크인"}
        </Button>
        <Button
          variant={checkout && !checkin ? "default" : "outline"}
          size="sm"
          className={`min-h-[38px] px-4 rounded-full whitespace-nowrap flex-shrink-0 transition-all font-semibold ${checkout && !checkin ? "shadow-md scale-105" : "hover:bg-muted/80 shadow-sm"
            }`}
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            if (checkout === today && !checkin) {
              handleReset();
            } else {
              setCheckin('');
              setCheckout(today);
              setStatus('all');
              setSearch('');
              startTransition(() => {
                router.push(`/admin/reservations?checkout=${today}`);
              });
            }
          }}
        >
          {checkout && !checkin ? "✓ 오늘 체크아웃" : "오늘 체크아웃"}
        </Button>
        <Button
          variant={initialFilter === 'd1-unassigned' ? "default" : "outline"}
          size="sm"
          className={`min-h-[38px] px-4 rounded-full whitespace-nowrap flex-shrink-0 transition-all font-semibold ${initialFilter === 'd1-unassigned' ? "shadow-md scale-105" : "hover:bg-muted/80 shadow-sm"
            }`}
          onClick={() => {
            if (initialFilter === 'd1-unassigned') {
              handleReset();
            } else {
              setStatus('all');
              setCheckin('');
              setCheckout('');
              setSearch('');
              startTransition(() => {
                const params = new URLSearchParams();
                params.set('filter', 'd1-unassigned');
                params.set('view', 'list');
                router.push(`/admin/reservations?${params.toString()}`);
              });
            }
          }}
        >
          {initialFilter === 'd1-unassigned' ? "✓ 미배정만" : "미배정만"}
        </Button>
        <Button
          variant={checkin && checkout ? "default" : "outline"}
          size="sm"
          className={`min-h-[38px] px-4 rounded-full whitespace-nowrap flex-shrink-0 transition-all font-semibold ${checkin && checkout ? "shadow-md scale-105" : "hover:bg-muted/80 shadow-sm"
            }`}
          onClick={() => {
            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            const startStr = weekStart.toISOString().split('T')[0];
            const endStr = weekEnd.toISOString().split('T')[0];

            if (checkin === startStr && checkout === endStr) {
              handleReset();
            } else {
              setStatus('all');
              setSearch('');
              setCheckin(startStr);
              setCheckout(endStr);
              startTransition(() => {
                router.push(`/admin/reservations?checkin=${startStr}&checkout=${endStr}`);
              });
            }
          }}
        >
          {checkin && checkout ? "✓ 이번 주" : "이번 주"}
        </Button>
      </div>

      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm text-muted-foreground">적용된 필터:</span>
          {status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              상태: {status === 'pending' ? '대기' : status === 'assigned' ? '배정 완료' : status === 'checked_in' ? '체크인' : status === 'checked_out' ? '체크아웃' : status === 'cancelled' ? '취소' : status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setStatus('all');
                  handleFilterChange();
                }}
                aria-label="상태 필터 제거"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setStatus('all');
                    handleFilterChange();
                  }
                }}
              />
            </Badge>
          )}
          {search && (
            <Badge variant="secondary" className="gap-1">
              검색: {search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setSearch('');
                  handleFilterChange();
                }}
                aria-label="검색 필터 제거"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSearch('');
                    handleFilterChange();
                  }
                }}
              />
            </Badge>
          )}
          {checkin && (
            <Badge variant="secondary" className="gap-1">
              체크인: {checkin}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setCheckin('');
                  handleFilterChange();
                }}
                aria-label="체크인 날짜 필터 제거"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCheckin('');
                    handleFilterChange();
                  }
                }}
              />
            </Badge>
          )}
          {checkout && (
            <Badge variant="secondary" className="gap-1">
              체크아웃: {checkout}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setCheckout('');
                  handleFilterChange();
                }}
                aria-label="체크아웃 날짜 필터 제거"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCheckout('');
                    handleFilterChange();
                  }
                }}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs min-h-[44px]"
            aria-label="모든 필터 초기화"
          >
            전체 초기화
          </Button>
        </div>
      )}

    </div>
  );
}
