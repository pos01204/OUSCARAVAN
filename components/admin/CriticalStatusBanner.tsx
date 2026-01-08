'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CriticalStatusBannerProps {
  unassignedCount: number;
}

export function CriticalStatusBanner({ unassignedCount }: CriticalStatusBannerProps) {
  const router = useRouter();

  if (unassignedCount === 0) {
    return null;
  }

  const handleClick = () => {
    // 딥 링크: 특정 필터가 적용된 상태로 예약 관리 페이지 열기
    router.push('/admin/reservations?view=list&filter=d1-unassigned');
  };

  return (
    <Card className="border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer" onClick={handleClick}>
      <div className="p-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-900">
            내일 체크인 예정인 미배정 예약이 {unassignedCount}건 있습니다.
          </p>
          <p className="text-xs text-orange-700 mt-1">
            클릭하여 즉시 배정하러 가기
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-orange-300 text-orange-700 hover:bg-orange-200"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          확인
        </Button>
      </div>
    </Card>
  );
}
