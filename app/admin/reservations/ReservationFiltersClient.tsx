'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { sanitizeInput } from '@/lib/security';

export function ReservationFiltersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [checkin, setCheckin] = useState(searchParams.get('checkin') || '');
  const [checkout, setCheckout] = useState(searchParams.get('checkout') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  
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
      {/* 빠른 필터 */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          variant="outline"
          size="sm"
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
        >
          오늘 체크인
        </Button>
        <Button
          variant="outline"
          size="sm"
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
        >
          오늘 체크아웃
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // 미배정은 assignedRoom이 없는 예약이므로 검색으로 처리
            // (실제로는 리스트 뷰에서 클라이언트 사이드 필터링)
            setStatus('all');
            setCheckin('');
            setCheckout('');
            setSearch('');
            startTransition(() => {
              router.push('/admin/reservations');
            });
          }}
          title="리스트 뷰에서 미배정 예약을 확인하세요"
        >
          미배정만
        </Button>
        <Button
          variant="outline"
          size="sm"
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
        >
          이번 주
        </Button>
      </div>
      
      {/* 컴팩트 필터 바 */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-md border">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="예약자명, 예약번호..."
            className="w-48"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFilterChange();
              }
            }}
          />
        </div>
        
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-32">
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
          className="w-40"
          value={checkin}
          onChange={(e) => setCheckin(e.target.value)}
        />
        
        <Input
          type="date"
          placeholder="체크아웃"
          className="w-40"
          value={checkout}
          onChange={(e) => setCheckout(e.target.value)}
        />
        
        <Button
          onClick={handleFilterChange}
          disabled={isPending}
        >
          {isPending ? '적용 중...' : '적용'}
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={isPending}
        >
          초기화
        </Button>
      </div>
    </div>
  );
}
