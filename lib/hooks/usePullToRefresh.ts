'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  enabled?: boolean;
}

/**
 * 풀 투 리프레시 기능을 제공하는 커스텀 훅
 * Phase 3: 제스처 지원
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || isRefreshing) return;

      const element = elementRef.current;
      if (!element) return;

      // 스크롤이 맨 위에 있을 때만 활성화
      if (element.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    },
    [enabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !isPulling || startY.current === null || isRefreshing) return;

      const element = elementRef.current;
      if (!element) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      // 아래로 당기는 경우만 처리
      if (distance > 0 && element.scrollTop === 0) {
        setPullDistance(Math.min(distance, threshold * 1.5));
        e.preventDefault(); // 기본 스크롤 방지
      }
    },
    [enabled, isPulling, threshold, isRefreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !isPulling || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    startY.current = null;
  }, [enabled, isPulling, pullDistance, threshold, onRefresh, isRefreshing]);

  // 스크롤 위치 감지
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      if (element.scrollTop > 0 && isPulling) {
        setIsPulling(false);
        setPullDistance(0);
        startY.current = null;
      }
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [isPulling]);

  return {
    ref: elementRef,
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress: Math.min(pullDistance / threshold, 1),
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
