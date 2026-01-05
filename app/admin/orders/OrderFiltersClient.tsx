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

export function OrderFiltersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  
  const handleFilterChange = () => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.set('status', status);
      if (date) params.set('date', date);
      if (search) params.set('search', search);
      
      router.push(`/admin/orders?${params.toString()}`);
    });
  };
  
  const handleReset = () => {
    setStatus('all');
    setDate('');
    setSearch('');
    startTransition(() => {
      router.push('/admin/orders');
    });
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>필터</CardTitle>
        <CardDescription>주문 목록을 필터링하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="search">검색</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="주문 ID, 주문 타입..."
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
                <SelectItem value="preparing">준비 중</SelectItem>
                <SelectItem value="delivering">배송 중</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">주문 날짜</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
