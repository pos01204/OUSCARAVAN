'use client';

import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FloorPlanViewer } from '@/components/features/FloorPlanViewer';
import { getSpaceByRoom } from '@/lib/constants/floorPlan';
import { MapPin } from 'lucide-react';

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
  const roomLabel = `카라반 ${assignedRoom.replace('호', '')}`;
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
    <Card className="border-primary/10 shadow-sm overflow-hidden" role="region" aria-label="배정된 공간 약도">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-primary/10">
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-xl">배정된 카라반 위치</CardTitle>
            <CardDescription className="text-sm">현재 배정된 카라반 위치를 지도에서 바로 확인하세요</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <div className="w-full rounded-lg border-2 border-border bg-muted/30 p-3 md:p-4 overflow-hidden">
          <FloorPlanViewer assignedRoom={assignedRoom} showLabels={false} />
        </div>
        <div className="flex items-center justify-center gap-2 text-sm mb-0" role="status" aria-live="polite">
          <div
            className="h-3 w-3 rounded-full bg-red-500 border-2 border-red-600 animate-pulse"
            aria-label="배정된 공간 표시"
          ></div>
          <p className="font-medium text-primary">
            고객님의 공간: {roomLabel}{positionLabel ? ` (${positionLabel})` : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const FloorPlanCard = memo(FloorPlanCardComponent);
