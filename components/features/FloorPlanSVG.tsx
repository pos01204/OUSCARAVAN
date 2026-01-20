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
  const { viewBox, spaces, facilities } = FLOOR_PLAN_CONFIG;

  // 배정된 공간 정보 메모이제이션
  const assignedSpace = useMemo(() => {
    if (!assignedSpaceId) return null;
    return spaces.find(space => space.id === assignedSpaceId);
  }, [assignedSpaceId, spaces]);

  // 공간 클릭 핸들러 메모이제이션
  const handleSpaceClick = useCallback((spaceId: string) => {
    onSpaceClick?.(spaceId);
  }, [onSpaceClick]);

  // 브랜드 색상
  const COLORS = {
    background: '#FAF8F5',
    assigned: {
      fill: '#1A1714',
      stroke: '#1A1714',
      text: '#FFFFFF',
    },
    unassigned: {
      fill: '#F5F2ED',
      stroke: '#E8DCC8',
      text: '#9C9488',
    },
    facility: {
      fill: '#F5F2ED',
      stroke: '#C4B896',
      text: '#9C9488',
    },
    road: {
      fill: '#EDE8DF',
      stroke: '#C4B896',
      text: '#9C9488',
    },
  };

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-auto"
      role="img"
      aria-label="약도"
      preserveAspectRatio="xMidYMid meet"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* 배경 */}
      <rect x="0" y="0" width="100%" height="100%" fill={COLORS.background} />
      
      {/* 도로 표시 - 미니멀 */}
      <rect 
        x="203" y="5" width="16" height="270" 
        fill={COLORS.road.fill} 
        stroke={COLORS.road.stroke} 
        strokeWidth="1" 
        rx="3"
      />
      <text 
        x="211" y="140" 
        textAnchor="middle" 
        dominantBaseline="middle"
        style={{
          fontSize: '9px',
          fill: COLORS.road.text,
          fontFamily: "'Pretendard', sans-serif",
          fontWeight: '500',
          letterSpacing: '0.5px',
        }}
        transform="rotate(-90 211 140)"
      >
        도로
      </text>
      
      {/* 시설 렌더링 - 미니멀 스타일 */}
      {facilities.map((facility) => (
        <g key={facility.id}>
          <rect
            x={facility.coordinates.x}
            y={facility.coordinates.y}
            width={facility.coordinates.width}
            height={facility.coordinates.height}
            fill={COLORS.facility.fill}
            stroke={COLORS.facility.stroke}
            strokeWidth={1}
            rx="6"
          />
          {facility.name && (
            <text
              x={facility.coordinates.x + facility.coordinates.width / 2}
              y={facility.coordinates.y + facility.coordinates.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '10px',
                fontWeight: '500',
                fill: COLORS.facility.text,
                fontFamily: "'Pretendard', sans-serif",
              }}
            >
              {facility.name}
            </text>
          )}
        </g>
      ))}
      
      {/* 공간 렌더링 */}
      {spaces.map((space) => {
        const isAssigned = space.id === assignedSpaceId;
        
        return (
          <g key={space.id}>
            {/* 배정된 공간 - 글로우 효과 */}
            {isAssigned && (
              <rect
                x={space.coordinates.x - 2}
                y={space.coordinates.y - 2}
                width={space.coordinates.width + 4}
                height={space.coordinates.height + 4}
                fill="none"
                stroke={COLORS.assigned.stroke}
                strokeWidth={1}
                rx="10"
                opacity={0.3}
              />
            )}
            
            {/* 공간 사각형 */}
            <rect
              x={space.coordinates.x}
              y={space.coordinates.y}
              width={space.coordinates.width}
              height={space.coordinates.height}
              fill={isAssigned ? COLORS.assigned.fill : COLORS.unassigned.fill}
              stroke={isAssigned ? COLORS.assigned.stroke : COLORS.unassigned.stroke}
              strokeWidth={isAssigned ? 2 : 1}
              rx="6"
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
            />
            
            {/* 공간 라벨 */}
            <text
              x={space.coordinates.x + space.coordinates.width / 2}
              y={space.coordinates.y + space.coordinates.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: isAssigned ? '12px' : '10px',
                fontWeight: isAssigned ? '700' : '500',
                fill: isAssigned ? COLORS.assigned.text : COLORS.unassigned.text,
                fontFamily: "'Pretendard', sans-serif",
              }}
            >
              {space.displayName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const FloorPlanSVG = memo(FloorPlanSVGComponent);
