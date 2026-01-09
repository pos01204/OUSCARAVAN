'use client';

import { useEffect, useState } from 'react';
import { alarmService } from '@/lib/alarm-service';

/**
 * Service Worker 초기화 컴포넌트
 * 앱 시작 시 Service Worker를 등록하고 초기화합니다.
 */
export function ServiceWorkerInitializer() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initServiceWorker = async () => {
      try {
        // Service Worker 초기화
        const initialized = await alarmService.initialize();
        
        if (initialized) {
          console.log('[ServiceWorkerInitializer] Service Worker 초기화 완료');
          setIsReady(true);
        } else {
          console.warn('[ServiceWorkerInitializer] Service Worker 초기화 실패');
        }
      } catch (error) {
        console.error('[ServiceWorkerInitializer] Service Worker 초기화 중 오류:', error);
      }
    };

    // 모바일 환경에서만 초기화 (데스크톱은 선택적)
    if (typeof window !== 'undefined') {
      initServiceWorker();
    }
  }, []);

  // Service Worker 상태는 내부적으로만 사용 (UI에 표시하지 않음)
  return null;
}
