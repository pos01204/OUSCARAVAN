'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FloorPlanViewer } from '@/components/features/FloorPlanViewer';
import { getSpaceByRoom } from '@/lib/constants/floorPlan';
import { MapPin, Navigation } from 'lucide-react';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { GuestMotionCard } from '@/components/guest/GuestMotionCard';

interface FloorPlanCardProps {
  assignedRoom?: string;
}

function FloorPlanCardComponent({ assignedRoom }: FloorPlanCardProps) {
  // 관리자가 방 배정을 하는 시점부터 약도 표시 (체크인 전에도 표시)
  // assignedRoom이 있으면 표시 (체크인 여부와 무관)
  if (!assignedRoom) {
    return null;
  }

  const assignedSpace = getSpaceByRoom(assignedRoom);
  // 위치 정보만 표시 (카라반 번호는 고객에게 노출하지 않음)
  const positionLabel = (() => {
    if (!assignedSpace) return '배정 완료';
    const centerX = assignedSpace.coordinates.x + assignedSpace.coordinates.width / 2;
    const centerY = assignedSpace.coordinates.y + assignedSpace.coordinates.height / 2;
    const isLeft = centerX < 203;
    const xLabel = isLeft ? '좌측' : '우측';
    const yLabel = centerY < 150 ? '상단' : centerY < 210 ? '중단' : '하단';
    return `${xLabel} ${yLabel}`;
  })();

  return (
    <GuestMotionCard>
      <Card variant="info" role="region" aria-label="배정된 공간 약도">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-brand-dark">
          <CardIconBadge icon={MapPin} tone="warning" />
          배정된 위치
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 약도 */}
        <div className="w-full rounded-xl bg-background overflow-hidden">
          <FloorPlanViewer assignedRoom={assignedRoom} showLabels={true} />
        </div>
        
        {/* 배정 정보 - 위치만 표시 (번호 미노출) */}
        <div 
          className="flex items-center gap-4 rounded-xl bg-primary p-4"
          role="status" 
          aria-live="polite"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
            <Navigation className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-white/70 font-medium">고객님의 공간</p>
            <p className="text-lg font-bold text-white">
              {positionLabel} 카라반
            </p>
          </div>
        </div>
      </CardContent>
      </Card>
    </GuestMotionCard>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const FloorPlanCard = memo(FloorPlanCardComponent);
