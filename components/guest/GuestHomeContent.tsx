'use client';

import { PreCheckinHome, CheckedInHome, CheckedOutHome } from './home';
import type { Reservation } from '@/lib/api';

interface GuestHomeContentProps {
  reservation: Reservation;
  token: string;
}

/**
 * 고객 홈 페이지 콘텐츠
 * 예약 상태에 따라 다른 UI를 렌더링합니다.
 * 
 * - pre_checkin: 체크인 유도 UI (체크인 CTA 강조)
 * - checked_in: 서비스 이용 UI (주문 강조, 체크아웃 리마인더)
 * - checked_out: 감사 인사 UI (후기, SNS, 방문 요약)
 */
export function GuestHomeContent({ reservation, token }: GuestHomeContentProps) {
  const status = reservation.status;

  // 체크아웃 완료 상태
  if (status === 'checked_out') {
    return <CheckedOutHome reservation={reservation} token={token} />;
  }

  // 체크인 완료 상태
  if (status === 'checked_in') {
    return <CheckedInHome reservation={reservation} token={token} />;
  }

  // 체크인 전 상태 (기본)
  return <PreCheckinHome reservation={reservation} token={token} />;
}
