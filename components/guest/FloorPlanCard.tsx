'use client';

import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FloorPlanViewer } from '@/components/features/FloorPlanViewer';
import { MapPin } from 'lucide-react';
import { useGuestStore } from '@/lib/store';

interface FloorPlanCardProps {
  assignedRoom?: string;
}

function FloorPlanCardComponent({ assignedRoom }: FloorPlanCardProps) {
  const { isCheckedIn } = useGuestStore();
  
  // 체크인 완료 후에만 표시 (assignedRoom이 있는 경우)
  // 설계 문서에 따르면 체크인 완료 후에만 약도 표시
  if (!assignedRoom || !isCheckedIn) {
    return null;
  }

  return (
    <Card className="border-primary/20 shadow-sm" role="region" aria-label="배정된 공간 약도">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle>배정된 공간</CardTitle>
        </div>
        <CardDescription>약도에서 당신의 공간을 확인하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full rounded-lg border-2 border-border bg-muted/30 p-3 md:p-4 overflow-hidden">
          <FloorPlanViewer assignedRoom={assignedRoom} showLabels={true} />
        </div>
        <div className="flex items-center justify-center gap-2 text-sm" role="status" aria-live="polite">
          <div 
            className="h-3 w-3 rounded-full bg-red-500 border-2 border-red-600 animate-pulse"
            aria-label="배정된 공간 표시"
          ></div>
          <p className="font-medium text-primary">
            당신의 공간
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const FloorPlanCard = memo(FloorPlanCardComponent);
