'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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

  // 내일 날짜 계산
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  // "내일 체크인" 버튼 활성 상태 확인
  const isTomorrowCheckinActive = checkin === tomorrowStr && !checkout && !initialFilter;

  // 활성 필터 확인
  const hasActiveFilters = status !== 'all' || checkin || checkout || search;

  const activeFilterCount =
    (status !== 'all' ? 1 : 0) +
    (checkin ? 1 : 0) +
    (checkout ? 1 : 0) +
    (search ? 1 : 0);

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

      // 필터 적용은 업무 모드(리스트)로 자연스럽게 유도
      params.set('view', 'list');
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


  const applyPreset = (preset: 'today' | 'tomorrow' | 'unassigned') => {
    startTransition(() => {
      const params = new URLSearchParams();
      const todayStr = new Date().toISOString().split('T')[0];

      // 공통: 업무 프리셋은 리스트 뷰로 유도
      params.set('view', 'list');

      if (preset === 'today') {
        params.set('checkin', todayStr);
      }

      if (preset === 'tomorrow') {
        params.set('checkin', tomorrowStr);
      }

      if (preset === 'unassigned') {
        params.set('filter', 'd1-unassigned');
        params.set('checkin', tomorrowStr);
      }

      router.push(`/admin/reservations?${params.toString()}`);
    });
  };

  return (
    <div className="mb-4 w-full max-w-7xl mx-auto px-4 md:px-6">
      {/* 1단: 프리셋 1줄(가로 스크롤) + 필터 버튼 (상단 과밀 방지) */}
      <div className="flex items-center gap-2">
        <div className="flex-1 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full px-4 text-xs font-bold"
              onClick={() => applyPreset('today')}
            >
              오늘
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full px-4 text-xs font-bold"
              onClick={() => applyPreset('tomorrow')}
            >
              내일
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full px-4 text-xs font-bold"
              onClick={() => applyPreset('unassigned')}
            >
              미배정
            </Button>
          </div>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full px-3 relative"
              aria-label="필터 열기"
            >
              <Filter className="h-4 w-4 mr-1" />
              필터
              {activeFilterCount > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>예약 필터</SheetTitle>
            </SheetHeader>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>상태</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
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

              <div className="space-y-2">
                <Label>검색</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="예약자/예약번호 검색"
                    className="w-full h-10 rounded-md border border-input bg-background pl-10 pr-3 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>체크인</Label>
                  <input
                    type="date"
                    value={checkin}
                    onChange={(e) => setCheckin(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>체크아웃</Label>
                  <input
                    type="date"
                    value={checkout}
                    onChange={(e) => setCheckout(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {status !== 'all' && <Badge variant="secondary">상태: {status}</Badge>}
                  {search && <Badge variant="secondary">검색: {search}</Badge>}
                  {checkin && <Badge variant="secondary">체크인: {checkin}</Badge>}
                  {checkout && <Badge variant="secondary">체크아웃: {checkout}</Badge>}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  초기화
                </Button>
                <Button className="flex-1" onClick={handleFilterChange} disabled={isPending}>
                  적용
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
