/**
 * 입력 검증 유틸리티 함수
 */

/**
 * 이메일 형식 검증
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 전화번호 형식 검증 (한국 전화번호)
 */
export function validatePhone(phone: string): boolean {
  // 하이픈 포함/미포함 모두 허용
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone);
}

/**
 * 날짜 형식 검증 (YYYY-MM-DD)
 */
export function validateDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

/**
 * UUID 형식 검증
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * 문자열 길이 검증
 */
export function validateLength(str: string, min: number, max: number): boolean {
  return str.length >= min && str.length <= max;
}

/**
 * 숫자 범위 검증
 */
export function validateRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}

/**
 * 필수 필드 검증
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return true;
}

/**
 * 예약 상태 검증
 */
export function validateReservationStatus(status: string): boolean {
  const validStatuses = ['pending', 'assigned', 'checked_in', 'checked_out', 'cancelled'];
  return validStatuses.includes(status);
}

/**
 * 주문 상태 검증
 */
export function validateOrderStatus(status: string): boolean {
  const validStatuses = ['pending', 'preparing', 'delivering', 'completed', 'cancelled'];
  return validStatuses.includes(status);
}

/**
 * 방 상태 검증
 */
export function validateRoomStatus(status: string): boolean {
  const validStatuses = ['available', 'occupied', 'maintenance'];
  return validStatuses.includes(status);
}

/**
 * 주문 타입 검증
 */
export function validateOrderType(type: string): boolean {
  return type === 'bbq' || type === 'fire';
}

/**
 * 주문 아이템 검증
 */
export function validateOrderItems(items: any[]): boolean {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }
  
  return items.every(item => {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.quantity === 'number' &&
      typeof item.price === 'number' &&
      item.quantity > 0 &&
      item.price >= 0
    );
  });
}
