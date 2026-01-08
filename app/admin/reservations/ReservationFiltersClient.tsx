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
      {/* 빠른 필터 (항상 표시) */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          className="min-h-[44px] min-w-[44px]" // Phase 1: 터치 타겟 확대
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            setCheckin(today);
            setCheckout('');
            setStatus('all');
            setSearch('');
            startTransition(() => {
              router.push(`/admin/reservations?checkin=${today}`);
            });
          }}
          aria-label="오늘 체크인 예약 필터 적용"
        >
          오늘 체크인
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="min-h-[44px] min-w-[44px]" // Phase 1: 터치 타겟 확대
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            setCheckin('');
            setCheckout(today);
            setStatus('all');
            setSearch('');
            startTransition(() => {
              router.push(`/admin/reservations?checkout=${today}`);
            });
          }}
          aria-label="오늘 체크아웃 예약 필터 적용"
        >
          오늘 체크아웃
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="min-h-[44px] min-w-[44px]" // Phase 1: 터치 타겟 확대
          onClick={() => {
            setStatus('all');
            setCheckin('');
            setCheckout('');
            setSearch('');
            startTransition(() => {
              router.push('/admin/reservations');
            });
          }}
          title="리스트 뷰에서 미배정 예약을 확인하세요"
          aria-label="미배정 예약만 표시 (리스트 뷰에서 확인)"
        >
          미배정만
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="min-h-[44px] min-w-[44px]" // Phase 1: 터치 타겟 확대
          onClick={() => {
            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            setCheckin(weekStart.toISOString().split('T')[0]);
            setCheckout(weekEnd.toISOString().split('T')[0]);
            setStatus('all');
            setSearch('');
            startTransition(() => {
              router.push(`/admin/reservations?checkin=${weekStart.toISOString().split('T')[0]}&checkout=${weekEnd.toISOString().split('T')[0]}`);
            });
          }}
          aria-label="이번 주 예약 필터 적용"
        >
          이번 주
        </Button>
        {/* Phase 1: 모바일 필터 버튼 */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] md:hidden"
              aria-label={`필터 ${hasActiveFilters ? '(활성화됨)' : ''}`}
              aria-expanded={isSheetOpen}
            >
              <Filter className="h-4 w-4 mr-1" aria-hidden="true" />
              필터
              {hasActiveFilters && (
                <span className="ml-1 h-2 w-2 rounded-full bg-primary" aria-label="활성 필터 표시" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>필터</SheetTitle>
              <SheetDescription>
                예약을 검색하고 필터링하세요
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              {/* 검색 */}
              <div className="space-y-2">
                <Label htmlFor="filter-search">검색</Label>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="filter-search"
                    placeholder="예약자명, 예약번호..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                    aria-label="예약자명 또는 예약번호로 검색"
                  />
                </div>
              </div>
              
              {/* 상태 선택 */}
              <div className="space-y-2">
                <Label htmlFor="filter-status">상태</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="filter-status" aria-label="예약 상태 선택">
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="pending">대기</SelectItem>
                    <SelectItem value="assigned">배정 완료</SelectItem>
                    <SelectItem value="checked_in">체크인</SelectItem>
                    <SelectItem value="checked_out">체크아웃</SelectItem>
                    <SelectItem value="cancelled">취소</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* 날짜 선택 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="filter-checkin">체크인</Label>
                  <Input
                    id="filter-checkin"
                    type="date"
                    value={checkin}
                    onChange={(e) => setCheckin(e.target.value)}
                    aria-label="체크인 날짜 선택"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-checkout">체크아웃</Label>
                  <Input
                    id="filter-checkout"
                    type="date"
                    value={checkout}
                    onChange={(e) => setCheckout(e.target.value)}
                    aria-label="체크아웃 날짜 선택"
                  />
                </div>
              </div>
              
              {/* 적용 버튼 */}
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 min-h-[44px]"
                  onClick={handleFilterChange}
                  disabled={isPending}
                >
                  {isPending ? '적용 중...' : '적용'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 min-h-[44px]"
                  onClick={handleReset}
                  disabled={isPending}
                >
                  초기화
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
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
      
      {/* 데스크톱: 컴팩트 필터 바 (모바일에서는 숨김) */}
      <div className="hidden md:flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-md border">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="예약자명, 예약번호..."
            className="w-48 min-h-[44px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFilterChange();
              }
            }}
            aria-label="예약자명 또는 예약번호로 검색"
          />
        </div>
        
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-32 min-h-[44px]" aria-label="예약 상태 선택">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">대기</SelectItem>
            <SelectItem value="assigned">배정 완료</SelectItem>
            <SelectItem value="checked_in">체크인</SelectItem>
            <SelectItem value="checked_out">체크아웃</SelectItem>
            <SelectItem value="cancelled">취소</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          type="date"
          placeholder="체크인"
          className="w-40 min-h-[44px]"
          value={checkin}
          onChange={(e) => setCheckin(e.target.value)}
          aria-label="체크인 날짜 선택"
        />
        
        <Input
          type="date"
          placeholder="체크아웃"
          className="w-40 min-h-[44px]"
          value={checkout}
          onChange={(e) => setCheckout(e.target.value)}
          aria-label="체크아웃 날짜 선택"
        />
        
        <Button
          onClick={handleFilterChange}
          disabled={isPending}
          className="min-h-[44px]"
          aria-label="필터 적용"
        >
          {isPending ? '적용 중...' : '적용'}
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={isPending}
          className="min-h-[44px]"
          aria-label="필터 초기화"
        >
          초기화
        </Button>
      </div>
    </div>
  );
}
