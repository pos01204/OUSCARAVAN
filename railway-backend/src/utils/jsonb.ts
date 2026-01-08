/**
 * JSONB 데이터 파싱 유틸리티 함수
 * PostgreSQL JSONB 필드 처리를 통일된 방식으로 처리
 */

/**
 * JSONB 데이터를 안전하게 파싱
 * @param data - JSONB 데이터 (문자열, 객체, 또는 배열)
 * @param defaultValue - 파싱 실패 시 반환할 기본값
 * @returns 파싱된 데이터 또는 기본값
 */
export function parseJSONB<T = unknown>(
  data: string | T | null | undefined,
  defaultValue: T | null = null
): T | null {
  // null 또는 undefined인 경우
  if (data === null || data === undefined) {
    return defaultValue;
  }
  
  // 이미 객체나 배열인 경우 그대로 반환
  if (typeof data === 'object' && !Array.isArray(data) || Array.isArray(data)) {
    return data as T;
  }
  
  // 문자열인 경우 JSON 파싱 시도
  if (typeof data === 'string') {
    // 빈 문자열인 경우
    if (data.trim() === '') {
      return defaultValue;
    }
    
    try {
      const parsed = JSON.parse(data);
      return parsed as T;
    } catch (error) {
      console.warn('[parseJSONB] Failed to parse JSON:', {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      return defaultValue;
    }
  }
  
  // 그 외의 경우 기본값 반환
  return defaultValue;
}

/**
 * JSONB 배열을 안전하게 파싱
 * @param data - JSONB 데이터
 * @returns 파싱된 배열 또는 빈 배열
 */
export function parseJSONBArray<T = unknown>(
  data: string | T[] | null | undefined
): T[] {
  const parsed = parseJSONB<T[]>(data, []);
  
  // 배열이 아닌 경우 빈 배열 반환
  if (!Array.isArray(parsed)) {
    return [];
  }
  
  return parsed;
}

/**
 * JSONB 객체를 안전하게 파싱
 * @param data - JSONB 데이터
 * @returns 파싱된 객체 또는 빈 객체
 */
export function parseJSONBObject<T extends Record<string, unknown> = Record<string, unknown>>(
  data: string | T | null | undefined
): T {
  const parsed = parseJSONB<T>(data, {} as T);
  
  // 객체가 아닌 경우 빈 객체 반환
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {} as T;
  }
  
  return parsed;
}
