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
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { sanitizeInput } from '@/lib/security';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

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
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 초기 필터 적용 (서버에서 전달된 경우)
  useEffect(() => {
    if (initialCheckin) {
      setCheckin(initialCheckin);
      const date = new Date(initialCheckin);
      setCurrentMonth(date);
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

  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    const todayStr = today.toISOString().split('T')[0];
    setCheckin(todayStr);
    setCheckout('');
    setStatus('all');
    setSearch('');
    startTransition(() => {
      router.push(`/admin/reservations?checkin=${todayStr}`);
    });
  };

  return (
    <div className="mb-6 w-full max-w-7xl mx-auto px-4 md:px-6 space-y-4">
      {/* Tier 1: Filter Group (Transient Status) - Optimized for horizontal width */}
      <div className="flex items-center p-1 bg-muted/30 rounded-lg md:rounded-full border border-border/40 gap-0.5 md:gap-1 w-full overflow-hidden">
        <Button
          variant={checkin && !checkout ? "default" : "ghost"}
          size="sm"
          className={`h-9 md:h-10 flex-1 rounded-md md:rounded-full whitespace-nowrap transition-all text-xs font-bold ${
            checkin && !checkout 
              ? "shadow-sm bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-muted-foreground hover:text-foreground hover:bg-transparent"
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
              setCurrentMonth(new Date());
              startTransition(() => {
                router.push(`/admin/reservations?checkin=${today}`);
              });
            }
          }}
        >
          {checkin && !checkout && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />}
          오늘 체크인
        </Button>
        <div className="w-[1px] h-4 bg-border/40 mx-0.5 hidden md:block" />
        <Button
          variant={checkout && !checkin ? "default" : "ghost"}
          size="sm"
          className={`h-9 md:h-10 flex-1 rounded-md md:rounded-full whitespace-nowrap transition-all text-xs font-bold ${
            checkout && !checkin 
              ? "shadow-sm bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-muted-foreground hover:text-foreground hover:bg-transparent"
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
              setCurrentMonth(new Date());
              startTransition(() => {
                router.push(`/admin/reservations?checkout=${today}`);
              });
            }
          }}
        >
          {checkout && !checkin && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />}
          오늘 체크아웃
        </Button>
        <div className="w-[1px] h-4 bg-border/40 mx-0.5 hidden md:block" />
        <Button
          variant={initialFilter === 'd1-unassigned' ? "default" : "ghost"}
          size="sm"
          className={`h-9 md:h-10 flex-1 rounded-md md:rounded-full whitespace-nowrap transition-all text-xs font-bold ${
            initialFilter === 'd1-unassigned' 
              ? "shadow-sm bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-muted-foreground hover:text-foreground hover:bg-transparent"
          }`}
          onClick={() => {
            if (initialFilter === 'd1-unassigned') {
              handleReset();
            } else {
              setStatus('all');
              setCheckin('');
              setCheckout('');
              setSearch('');
              setCurrentMonth(new Date());
              startTransition(() => {
                const params = new URLSearchParams();
                params.set('filter', 'd1-unassigned');
                params.set('view', 'list');
                router.push(`/admin/reservations?${params.toString()}`);
              });
            }
          }}
        >
          {initialFilter === 'd1-unassigned' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />}
          미배정
        </Button>
        <div className="w-[1px] h-4 bg-border/40 mx-0.5 hidden md:block" />
        <Button
          variant={checkin && checkout ? "default" : "ghost"}
          size="sm"
          className={`h-9 md:h-10 flex-1 rounded-md md:rounded-full whitespace-nowrap transition-all text-xs font-bold ${
            checkin && checkout 
              ? "shadow-sm bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-muted-foreground hover:text-foreground hover:bg-transparent"
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
              setCurrentMonth(weekStart);
              startTransition(() => {
                router.push(`/admin/reservations?checkin=${startStr}&checkout=${endStr}`);
              });
            }
          }}
        >
          {checkin && checkout && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />}
          이번 주
        </Button>
      </div>

      {/* 날짜 네비게이션 */}
      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-sm md:text-base font-semibold text-foreground whitespace-nowrap">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
            className="h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm border-border/40 hover:bg-muted/50"
          >
            <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline ml-1">이전</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className={`h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm ${
              isSameDay(currentMonth, new Date())
                ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                : 'border-border/40 hover:bg-muted/50'
            }`}
          >
            오늘
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm border-border/40 hover:bg-muted/50"
          >
            <span className="hidden sm:inline mr-1">다음</span>
            <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>

      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          <span className="text-xs md:text-sm text-muted-foreground">적용된 필터:</span>
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
            className="text-xs h-7 md:h-8 px-2 md:px-3"
            aria-label="모든 필터 초기화"
          >
            전체 초기화
          </Button>
        </div>
      )}
    </div>
  );
}
