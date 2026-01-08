/**
 * 날짜 파싱 및 포맷팅 유틸리티 함수
 * 모든 날짜 처리를 통일된 방식으로 처리
 */

/**
 * 날짜 문자열을 Date 객체로 파싱
 * @param dateString - 날짜 문자열 (YYYY-MM-DD 형식 또는 ISO 8601)
 * @returns Date 객체 또는 null (파싱 실패 시)
 */
export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

/**
 * 날짜를 YYYY-MM-DD 형식 문자열로 변환
 * @param date - Date 객체 또는 날짜 문자열
 * @returns YYYY-MM-DD 형식 문자열 또는 빈 문자열
 */
export function formatDateToISO(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  if (!dateObj) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 날짜를 한국어 형식으로 포맷팅 (예: "2025년 1월 15일")
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 포맷팅된 날짜 문자열 또는 빈 문자열
 */
export function formatDateToKorean(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  if (!dateObj) return '';
  
  return dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 날짜와 시간을 한국어 형식으로 포맷팅 (예: "2025년 1월 15일 오후 3시 30분")
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 포맷팅된 날짜/시간 문자열 또는 빈 문자열
 */
export function formatDateTimeToKorean(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  if (!dateObj) return '';
  
  return dateObj.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 날짜 문자열을 정규화 (다양한 형식을 YYYY-MM-DD로 변환)
 * @param dateStr - 날짜 문자열 (예: "2026.01.05.(일)", "2026-01-05")
 * @returns YYYY-MM-DD 형식 문자열 또는 null
 */
export function normalizeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  
  // "2026.01.05.(일)" 형식 또는 "2026-01-05" 형식 처리
  const match = dateStr.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  
  return null;
}

/**
 * 두 날짜 사이의 일수 계산
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns 일수 (음수 가능)
 */
export function daysBetween(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): number | null {
  const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDate(endDate) : endDate;
  
  if (!start || !end) return null;
  
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 날짜가 유효한지 검증
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 유효한 날짜인지 여부
 */
export function isValidDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  return dateObj !== null && !isNaN(dateObj.getTime());
}
