/**
 * 예약 관련 유틸리티 함수
 * 관리자 페이지와 고객 페이지에서 공통으로 사용
 */

import type { Reservation } from '@/types';

/**
 * 옵션명 포맷팅 (대괄호 태그 추출)
 */
export function formatOptionName(name: string): {
  tags: string[];
  mainName: string;
  fullName: string;
} {
  // 대괄호 내용 추출 및 정리
  const bracketMatch = name.match(/\[([^\]]+)\]/);
  const bracketContent = bracketMatch ? bracketMatch[1] : null;
  const nameWithoutBracket = name.replace(/\[[^\]]+\]\s*/, '').trim();
  
  return {
    tags: bracketContent ? bracketContent.split(',').map(t => t.trim()) : [],
    mainName: nameWithoutBracket,
    fullName: name,
  };
}

/**
 * 총 결제금액 계산
 */
export function calculateTotalAmount(reservation: Reservation): {
  roomAmount: number;
  optionsAmount: number;
  totalAmount: number;
} {
  const roomAmount = parseInt(reservation.amount || '0');
  const optionsAmount = reservation.options?.reduce((sum, opt) => sum + opt.optionPrice, 0) || 0;
  const totalAmount = roomAmount + optionsAmount;
  
  return {
    roomAmount,
    optionsAmount,
    totalAmount,
  };
}
