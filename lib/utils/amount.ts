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

/**
 * 숫자를 금액 문자열로 변환 (천 단위 구분자 포함)
 * @param amount - 금액 숫자
 * @param includeWon - "원" 접미사 포함 여부 (기본: false)
 * @returns 포맷팅된 금액 문자열 (예: "100,000" 또는 "100,000원")
 */
export function formatAmount(
  amount: number | string | null | undefined,
  includeWon: boolean = false
): string {
  const numAmount = typeof amount === 'string' ? parseAmount(amount) : (amount || 0);
  
  // 천 단위 구분자 추가
  const formatted = numAmount.toLocaleString('ko-KR');
  
  return includeWon ? `${formatted}원` : formatted;
}

/**
 * 금액을 안전하게 숫자로 변환 (에러 발생 시 기본값 반환)
 * @param amount - 금액 (문자열 또는 숫자)
 * @param defaultValue - 변환 실패 시 반환할 기본값 (기본: 0)
 * @returns 숫자 또는 기본값
 */
export function safeParseAmount(
  amount: string | number | null | undefined,
  defaultValue: number = 0
): number {
  try {
    return parseAmount(amount, defaultValue);
  } catch {
    return defaultValue;
  }
}

/**
 * 금액 배열의 합계 계산
 * @param amounts - 금액 배열 (문자열 또는 숫자)
 * @returns 합계
 */
export function sumAmounts(
  amounts: Array<string | number | null | undefined>
): number {
  return amounts.reduce((sum, amount) => {
    return sum + parseAmount(amount, 0);
  }, 0);
}

/**
 * 금액이 유효한지 검증
 * @param amount - 금액 (문자열 또는 숫자)
 * @returns 유효한 금액인지 여부
 */
export function isValidAmount(amount: string | number | null | undefined): boolean {
  if (amount === null || amount === undefined) {
    return false;
  }
  
  const parsed = parseAmount(amount, -1);
  return parsed >= 0;
}
