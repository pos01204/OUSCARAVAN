'use client';

import { useMemo } from 'react';
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
  // assignedRoom을 spaceId로 변환 (메모이제이션)
  // 예: "1호" → "1", "10호" → "10"
  const assignedSpaceId = useMemo(() => {
    if (!assignedRoom) return undefined;
    
    const spaceId = ROOM_TO_SPACE_MAP[assignedRoom];
    
    // 매핑 실패 시 콘솔 경고 (개발 환경)
    if (!spaceId && process.env.NODE_ENV === 'development') {
      console.warn(`[FloorPlanViewer] Room "${assignedRoom}" not found in ROOM_TO_SPACE_MAP`);
    }
    
    return spaceId || undefined;
  }, [assignedRoom]);

  // assignedRoom이 있지만 매핑이 실패한 경우 경고 표시 (개발 환경)
  if (assignedRoom && !assignedSpaceId && process.env.NODE_ENV === 'development') {
    console.warn('[FloorPlanViewer] Failed to map assignedRoom to spaceId:', {
      assignedRoom,
      availableRooms: Object.keys(ROOM_TO_SPACE_MAP),
    });
  }

  return (
    <div className="w-full" role="region" aria-label="약도">
      <FloorPlanSVG
        assignedSpaceId={assignedSpaceId}
        onSpaceClick={interactive ? onSpaceClick : undefined}
        showLabels={showLabels}
      />
      {/* 매핑 실패 시 사용자에게 알림 (선택사항) */}
      {assignedRoom && !assignedSpaceId && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          약도 정보를 불러올 수 없습니다.
        </div>
      )}
    </div>
  );
}
