/**
 * 보안 유틸리티 함수
 */

/**
 * HTML 태그 제거 (XSS 방지)
 * @param input 입력 문자열
 * @returns HTML 태그가 제거된 문자열
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // HTML 태그 제거
  return input.replace(/<[^>]*>/g, '');
}

/**
 * 특수 문자 이스케이프 (XSS 방지)
 * @param input 입력 문자열
 * @returns 이스케이프된 문자열
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * SQL Injection 방지를 위한 문자열 정리
 * @param input 입력 문자열
 * @returns 정리된 문자열
 */
export function sanitizeSql(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // SQL Injection 패턴 제거
  return input
    .replace(/['";\\]/g, '') // 작은따옴표, 큰따옴표, 세미콜론, 백슬래시 제거
    .replace(/--/g, '') // SQL 주석 제거
    .replace(/\/\*/g, '') // SQL 주석 시작 제거
    .replace(/\*\//g, ''); // SQL 주석 끝 제거
}

/**
 * URL 안전성 검증
 * @param url URL 문자열
 * @returns 안전한 URL인지 여부
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    // 허용된 프로토콜만 허용
    const allowedProtocols = ['http:', 'https:', 'tel:', 'mailto:'];
    return allowedProtocols.includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * 파일명 안전성 검증
 * @param filename 파일명
 * @returns 안전한 파일명인지 여부
 */
export function isValidFilename(filename: string): boolean {
  if (!filename || typeof filename !== 'string') {
    return false;
  }
  
  // 위험한 문자 제거
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  return !dangerousChars.test(filename);
}

/**
 * 입력값 길이 제한 (DoS 방지)
 * @param input 입력 문자열
 * @param maxLength 최대 길이
 * @returns 제한된 길이의 문자열
 */
export function limitLength(input: string, maxLength: number): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  if (input.length > maxLength) {
    return input.substring(0, maxLength);
  }
  
  return input;
}

/**
 * 사용자 입력 정리 (종합)
 * @param input 입력 문자열
 * @param options 옵션
 * @returns 정리된 문자열
 */
export function sanitizeInput(
  input: string,
  options: {
    maxLength?: number;
    allowHtml?: boolean;
    allowSpecialChars?: boolean;
  } = {}
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  let sanitized = input.trim();
  
  // HTML 태그 제거 (기본적으로 허용하지 않음)
  if (!options.allowHtml) {
    sanitized = sanitizeHtml(sanitized);
  }
  
  // 특수 문자 이스케이프
  if (!options.allowSpecialChars) {
    sanitized = escapeHtml(sanitized);
  }
  
  // 길이 제한
  if (options.maxLength) {
    sanitized = limitLength(sanitized, options.maxLength);
  }
  
  return sanitized;
}
