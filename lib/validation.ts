/**
 * 입력 검증 유틸리티 함수
 */

/**
 * 전화번호 형식 검증 (한국)
 * @param phoneNumber 전화번호 문자열
 * @returns 유효한 전화번호인지 여부
 */
export function validatePhone(phoneNumber: string): boolean {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }
  
  // 숫자만 허용, 하이픈/공백 제거 후 검증
  const cleaned = phoneNumber.replace(/[-\s()]/g, '');
  
  // 010, 011, 016, 017, 018, 019로 시작하는 10-11자리
  // 또는 02로 시작하는 9-10자리
  return /^(010|011|016|017|018|019)\d{7,8}$/.test(cleaned) || 
         /^02\d{7,8}$/.test(cleaned);
}

/**
 * 전화번호 정리 (하이픈 제거, 숫자만 추출)
 * @param phoneNumber 전화번호 문자열
 * @returns 정리된 전화번호 (하이픈 제거)
 */
export function cleanPhone(phoneNumber: string): string {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return '';
  }
  
  // 하이픈, 공백, 괄호 제거
  return phoneNumber.replace(/[-\s()]/g, '');
}

/**
 * 이메일 형식 검증
 * @param email 이메일 문자열
 * @returns 유효한 이메일인지 여부
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // 기본 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 날짜 형식 검증 (YYYY-MM-DD)
 * @param date 날짜 문자열
 * @returns 유효한 날짜 형식인지 여부
 */
export function validateDate(date: string): boolean {
  if (!date || typeof date !== 'string') {
    return false;
  }
  
  // YYYY-MM-DD 형식 검증
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  
  // 실제 유효한 날짜인지 확인
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * 문자열 길이 검증
 * @param value 검증할 문자열
 * @param min 최소 길이
 * @param max 최대 길이
 * @returns 유효한 길이인지 여부
 */
export function validateLength(value: string, min: number, max: number): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * 숫자 범위 검증
 * @param value 검증할 숫자
 * @param min 최소값
 * @param max 최대값
 * @returns 유효한 범위인지 여부
 */
export function validateRange(value: number, min: number, max: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }
  
  return value >= min && value <= max;
}

/**
 * 필수 필드 검증
 * @param value 검증할 값
 * @returns 값이 존재하는지 여부
 */
export function validateRequired(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  return true;
}

/**
 * 예약 번호 형식 검증
 * @param reservationNumber 예약 번호 문자열
 * @returns 유효한 예약 번호인지 여부
 */
export function validateReservationNumber(reservationNumber: string): boolean {
  if (!reservationNumber || typeof reservationNumber !== 'string') {
    return false;
  }
  
  // 예약 번호는 숫자로만 구성되어야 함
  return /^\d+$/.test(reservationNumber.trim());
}
