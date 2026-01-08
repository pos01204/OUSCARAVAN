'use client';

import { useMemo, memo, useCallback } from 'react';
import { FLOOR_PLAN_CONFIG } from '@/lib/constants/floorPlan';
import type { FloorPlanSpace } from '@/types/floorPlan';

interface FloorPlanSVGProps {
  assignedSpaceId?: string;
  onSpaceClick?: (spaceId: string) => void;
  showLabels?: boolean;
}

function FloorPlanSVGComponent({
  assignedSpaceId,
  onSpaceClick,
  showLabels = true,
}: FloorPlanSVGProps) {
  const { viewBox, spaces } = FLOOR_PLAN_CONFIG;

  // 배정된 공간 정보 메모이제이션
  const assignedSpace = useMemo(() => {
    if (!assignedSpaceId) return null;
    return spaces.find(space => space.id === assignedSpaceId);
  }, [assignedSpaceId, spaces]);

  // 공간 클릭 핸들러 메모이제이션
  const handleSpaceClick = useCallback((spaceId: string) => {
    onSpaceClick?.(spaceId);
  }, [onSpaceClick]);

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-auto"
      role="img"
      aria-label="약도"
      preserveAspectRatio="xMidYMid meet"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* 배경 그리드 (선택사항) - 약도 구조를 위한 가이드라인 */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.2" />
        </pattern>
      </defs>
      {/* 도로 표시 (중앙 세로선) */}
      <rect x="450" y="0" width="20" height="700" fill="#d1d5db" opacity="0.3" />
      <text x="460" y="350" textAnchor="middle" dominantBaseline="middle" 
            style={{ fontSize: '12px', fill: '#6b7280', fontFamily: 'system-ui' }}
            transform="rotate(-90 460 350)">
        도로
      </text>
      
      {/* 공간 렌더링 */}
      {spaces.map((space) => {
        const isAssigned = space.id === assignedSpaceId;
        
        return (
          <g key={space.id}>
            {/* 공간 사각형 */}
            <rect
              x={space.coordinates.x}
              y={space.coordinates.y}
              width={space.coordinates.width}
              height={space.coordinates.height}
              fill={isAssigned ? 'rgba(239, 68, 68, 0.15)' : '#ffffff'}
              stroke={isAssigned ? '#ef4444' : '#d1d5db'}
              strokeWidth={isAssigned ? 3 : 1.5}
              rx="4"
              ry="4"
              className={onSpaceClick ? 'cursor-pointer hover:opacity-90 transition-all duration-200' : ''}
              onClick={() => handleSpaceClick(space.id)}
              aria-label={`공간 ${space.displayName}${isAssigned ? ', 당신의 공간' : ''}`}
              role={onSpaceClick ? 'button' : undefined}
              tabIndex={onSpaceClick ? 0 : undefined}
              onKeyDown={onSpaceClick ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSpaceClick(space.id);
                }
              } : undefined}
              style={{
                filter: isAssigned ? 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))' : 'none',
              }}
            />
            {/* 공간 번호 텍스트 */}
            {showLabels && (
              <text
                x={space.coordinates.x + space.coordinates.width / 2}
                y={space.coordinates.y + space.coordinates.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: '16px',
                  fontWeight: isAssigned ? 'bold' : '600',
                  fill: isAssigned ? '#dc2626' : '#374151',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {space.displayName}
              </text>
            )}
            {/* 배정된 공간에만 "당신의 공간" 레이블 표시 (선택사항) */}
            {isAssigned && showLabels && (
              <text
                x={space.coordinates.x + space.coordinates.width / 2}
                y={space.coordinates.y + space.coordinates.height / 2 + 20}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  fill: '#ef4444',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                당신의 공간
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const FloorPlanSVG = memo(FloorPlanSVGComponent);
