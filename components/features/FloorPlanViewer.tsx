'use client';

import { FloorPlanSVG } from './FloorPlanSVG';
import { ROOM_TO_SPACE_MAP } from '@/lib/constants/floorPlan';

interface FloorPlanViewerProps {
  assignedRoom?: string;
  onSpaceClick?: (spaceId: string) => void;
  showLabels?: boolean;
  interactive?: boolean;
}

export function FloorPlanViewer({
  assignedRoom,
  onSpaceClick,
  showLabels = true,
  interactive = false,
}: FloorPlanViewerProps) {
  // assignedRoom을 spaceId로 변환
  // 예: "1호" → "1", "10호" → "10"
  const assignedSpaceId = assignedRoom
    ? ROOM_TO_SPACE_MAP[assignedRoom] || undefined
    : undefined;

  return (
    <div className="w-full">
      <FloorPlanSVG
        assignedSpaceId={assignedSpaceId}
        onSpaceClick={interactive ? onSpaceClick : undefined}
        showLabels={showLabels}
      />
    </div>
  );
}
