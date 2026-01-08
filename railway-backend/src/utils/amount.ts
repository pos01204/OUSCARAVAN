/**
 * 금액(Amount) 타입 변환 유틸리티 함수
 * string과 number 간 변환을 통일된 방식으로 처리
 */

/**
 * 금액 문자열을 숫자로 변환
 * @param amount - 금액 문자열 (예: "100000", "100,000", "100000원")
 * @param defaultValue - 변환 실패 시 반환할 기본값 (기본: 0)
 * @returns 숫자 또는 기본값
 */
export function parseAmount(
  amount: string | number | null | undefined,
  defaultValue: number = 0
): number {
  // null 또는 undefined인 경우
  if (amount === null || amount === undefined) {
    return defaultValue;
  }
  
  // 이미 숫자인 경우 그대로 반환
  if (typeof amount === 'number') {
    return isNaN(amount) ? defaultValue : amount;
  }
  
  // 문자열인 경우
  if (typeof amount === 'string') {
    // 빈 문자열인 경우
    if (amount.trim() === '') {
      return defaultValue;
    }
    
    // 쉼표와 "원" 제거 후 숫자로 변환
    const cleaned = amount.replace(/,/g, '').replace(/원/g, '').trim();
    const parsed = parseInt(cleaned, 10);
    
    // NaN이거나 음수인 경우 기본값 반환
    if (isNaN(parsed) || parsed < 0) {
      return defaultValue;
    }
    
    return parsed;
  }
  
  return defaultValue;
}
