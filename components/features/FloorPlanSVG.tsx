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
      {/* 도로 표시 (열3 위치, x=210) - CSV 그리드 구조에 맞춰 조정 */}
      <rect x="210" y="0" width="4" height="280" fill="#d1d5db" opacity="0.3" />
      <text x="212" y="140" textAnchor="middle" dominantBaseline="middle" 
            style={{ fontSize: '7px', fill: '#6b7280', fontFamily: 'system-ui' }}
            transform="rotate(-90 212 140)">
        도로
      </text>
      
      {/* 시설 렌더링 (주차공간, 관리동, 카페, 건물 등) */}
      {facilities.map((facility) => {
        const getFacilityColor = () => {
          switch (facility.type) {
            case 'parking':
              return { fill: '#dbeafe', stroke: '#3b82f6' }; // 파란색 계열로 주차공간 구분
            case 'building':
              return { fill: '#e5e7eb', stroke: '#6b7280' };
            case 'cafe':
              return { fill: '#fef3c7', stroke: '#f59e0b' };
            case 'warehouse':
              return { fill: '#e5e7eb', stroke: '#6b7280' };
            default:
              return { fill: '#f9fafb', stroke: '#d1d5db' };
          }
        };
        
        const colors = getFacilityColor();
        
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
              rx="4"
              ry="4"
              opacity="0.8"
            />
            {/* 건물/창고는 텍스트 표시하지 않음 */}
            {facility.name && (
              <text
                x={facility.coordinates.x + facility.coordinates.width / 2}
                y={facility.coordinates.y + facility.coordinates.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  fill: '#374151',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {facility.name}
              </text>
            )}
          </g>
        );
      })}
      
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
            {/* 배정된 공간에만 "당신의 공간" 레이블 표시 (호수 정보는 표시하지 않음) */}
            {isAssigned && (
              <text
                x={space.coordinates.x + space.coordinates.width / 2}
                y={space.coordinates.y + space.coordinates.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
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
