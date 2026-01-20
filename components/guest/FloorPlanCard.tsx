'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FloorPlanViewer } from '@/components/features/FloorPlanViewer';
import { getSpaceByRoom } from '@/lib/constants/floorPlan';
import { MapPin, Navigation } from 'lucide-react';

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
  const roomNumber = assignedRoom.replace('호', '');
  const positionLabel = (() => {
    if (!assignedSpace) return '';
    const centerX = assignedSpace.coordinates.x + assignedSpace.coordinates.width / 2;
    const centerY = assignedSpace.coordinates.y + assignedSpace.coordinates.height / 2;
    const isLeft = centerX < 203;
    const xLabel = isLeft ? '좌측' : '우측';
    const yLabel = centerY < 150 ? '상단' : centerY < 210 ? '중단' : '하단';
    return `${xLabel} ${yLabel}`;
  })();

  return (
    <Card role="region" aria-label="배정된 공간 약도">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-brand-dark">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <MapPin className="h-4 w-4" strokeWidth={2.5} />
          </div>
          배정된 위치
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 약도 */}
        <div className="w-full rounded-xl bg-background overflow-hidden">
          <FloorPlanViewer assignedRoom={assignedRoom} showLabels={true} />
        </div>
        
        {/* 배정 정보 - 깔끔한 카드 스타일 */}
        <div 
          className="flex items-center gap-4 rounded-xl bg-brand-dark p-4"
          role="status" 
          aria-live="polite"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
            <Navigation className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-white/70 font-medium">고객님의 공간</p>
            <p className="text-lg font-bold text-white">
              카라반 {roomNumber}
              {positionLabel && (
                <span className="ml-2 text-sm font-normal text-white/70">
                  {positionLabel}
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const FloorPlanCard = memo(FloorPlanCardComponent);
