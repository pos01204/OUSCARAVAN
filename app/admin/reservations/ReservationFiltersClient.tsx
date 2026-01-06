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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>필터</CardTitle>
        <CardDescription>예약 목록을 필터링하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="search">검색</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="예약자명, 예약번호..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFilterChange();
                  }
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">상태</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="전체" />
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
            <Label htmlFor="checkin">체크인 날짜</Label>
            <Input
              id="checkin"
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout">체크아웃 날짜</Label>
            <Input
              id="checkout"
              type="date"
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              onClick={handleFilterChange}
              disabled={isPending}
              className="flex-1"
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
      </CardContent>
    </Card>
  );
}
