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
      stroke: '#D4CFC4',
      text: 'transparent', // 번호 숨김
    },
    // 시설별 구분 색상
    parking: {
      fill: '#E8F4FD',
      stroke: '#93C5FD',
      text: '#3B82F6',
    },
    cafe: {
      fill: '#FEF3E2',
      stroke: '#FDBA74',
      text: '#EA580C',
    },
    building: {
      fill: '#F3E8FF',
      stroke: '#C4B5FD',
      text: '#7C3AED',
    },
    road: {
      fill: '#F5F2ED',
      stroke: '#D4CFC4',
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
      
      {/* 도로 표시 - 미니멀 (너비 확대: 206~234, 28px) */}
      <rect 
        x="206" y="5" width="34" height="270" 
        fill={COLORS.road.fill} 
        stroke={COLORS.road.stroke} 
        strokeWidth="1" 
        rx="3"
      />
      <text 
        x="223" y="140" 
        textAnchor="middle" 
        dominantBaseline="middle"
        style={{
          fontSize: '10px',
          fill: COLORS.road.text,
          fontFamily: "'Pretendard', sans-serif",
          fontWeight: '500',
          letterSpacing: '1px',
        }}
        transform="rotate(-90 223 140)"
      >
        도로
      </text>
      
      {/* 시설 렌더링 - 타입별 구분 색상 */}
      {facilities.map((facility) => {
        // 시설 타입에 따른 색상 선택
        const getFacilityColors = () => {
          switch (facility.type) {
            case 'parking':
              return COLORS.parking;
            case 'cafe':
              return COLORS.cafe;
            case 'building':
            case 'warehouse':
              return COLORS.building;
            default:
              return COLORS.building;
          }
        };
        const colors = getFacilityColors();
        
        return (
          <g key={facility.id}>
            <rect
              x={facility.coordinates.x}
              y={facility.coordinates.y}
              width={facility.coordinates.width}
              height={facility.coordinates.height}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={1.5}
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
                  fontWeight: '600',
                  fill: colors.text,
                  fontFamily: "'Pretendard', sans-serif",
                }}
              >
                {facility.name}
              </text>
            )}
          </g>
        );
      })}
      
      {/* 공간 렌더링 - 번호 미노출 (특정 방지) */}
      {spaces.map((space) => {
        const isAssigned = space.id === assignedSpaceId;
        
        return (
          <g key={space.id}>
            {/* 배정된 공간 - 글로우 효과 */}
            {isAssigned && (
              <rect
                x={space.coordinates.x - 3}
                y={space.coordinates.y - 3}
                width={space.coordinates.width + 6}
                height={space.coordinates.height + 6}
                fill="none"
                stroke={COLORS.assigned.stroke}
                strokeWidth={2}
                rx="10"
                opacity={0.25}
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
              aria-label={isAssigned ? '내 공간' : '다른 공간'}
              role={onSpaceClick ? 'button' : undefined}
              tabIndex={onSpaceClick ? 0 : undefined}
              onKeyDown={onSpaceClick ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSpaceClick(space.id);
                }
              } : undefined}
            />
            
            {/* 배정된 공간만 "내 공간" 텍스트 표시 */}
            {isAssigned && (
              <text
                x={space.coordinates.x + space.coordinates.width / 2}
                y={space.coordinates.y + space.coordinates.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  fill: COLORS.assigned.text,
                  fontFamily: "'Pretendard', sans-serif",
                }}
              >
                내 공간
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
