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
      if (search) {
        // 검색어 정리 (보안)
        const sanitizedSearch = sanitizeInput(search, { maxLength: 100 });
        params.set('search', sanitizedSearch);
      }

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
    <div className="mb-4">
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 gap-2 mb-3 scrollbar-hide">
        <Button
          variant={status === 'all' ? 'default' : 'outline'}
          size="sm"
          className="min-h-[36px] whitespace-nowrap flex-shrink-0"
          onClick={() => {
            setStatus('all');
            setDate('');
            setSearch('');
            startTransition(() => router.push('/admin/orders'));
          }}
        >
          전체
        </Button>
        <Button
          variant={status === 'pending' ? 'default' : 'outline'}
          size="sm"
          className="min-h-[36px] whitespace-nowrap flex-shrink-0"
          onClick={() => {
            setStatus('pending');
            startTransition(() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('status', 'pending');
              router.push(`/admin/orders?${params.toString()}`);
            });
          }}
        >
          확인
        </Button>
        <Button
          variant={status === 'completed' ? 'default' : 'outline'}
          size="sm"
          className="min-h-[36px] whitespace-nowrap flex-shrink-0"
          onClick={() => {
            setStatus('completed');
            startTransition(() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('status', 'completed');
              router.push(`/admin/orders?${params.toString()}`);
            });
          }}
        >
          완료
        </Button>
        <Button
          variant={date === new Date().toISOString().split('T')[0] ? 'default' : 'outline'}
          size="sm"
          className="min-h-[36px] whitespace-nowrap flex-shrink-0"
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            setDate(today);
            startTransition(() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('date', today);
              router.push(`/admin/orders?${params.toString()}`);
            });
          }}
        >
          오늘 주문
        </Button>
      </div>

      {/* 검색 바 (항상 노출) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="주문 ID, 주문 타입 검색..."
          className="pl-9 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleFilterChange();
          }}
        />
      </div>
    </div>
  );
}
