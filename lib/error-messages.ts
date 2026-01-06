/**
 * 사용자 친화적인 에러 메시지 유틸리티
 */

import type { ApiErrorCode } from '@/types';

/**
 * API 에러 코드에 따른 사용자 친화적인 메시지 반환
 */
export function getErrorMessage(errorCode?: ApiErrorCode, defaultMessage?: string): string {
  if (!errorCode) {
    return defaultMessage || '오류가 발생했습니다. 다시 시도해주세요.';
  }

  const errorMessages: Record<ApiErrorCode, string> = {
    INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다.',
    UNAUTHORIZED: '로그인이 필요합니다. 다시 로그인해주세요.',
    FORBIDDEN: '접근 권한이 없습니다.',
    NOT_FOUND: '요청한 정보를 찾을 수 없습니다.',
    VALIDATION_ERROR: '입력한 정보를 확인해주세요.',
    DUPLICATE_ENTRY: '이미 존재하는 정보입니다.',
    INTERNAL_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
    TIMEOUT_ERROR: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  };

  return errorMessages[errorCode] || defaultMessage || '오류가 발생했습니다. 다시 시도해주세요.';
}

/**
 * HTTP 상태 코드에 따른 사용자 친화적인 메시지 반환
 */
export function getHttpErrorMessage(status: number, defaultMessage?: string): string {
  const statusMessages: Record<number, string> = {
    400: '잘못된 요청입니다. 입력한 정보를 확인해주세요.',
    401: '로그인이 필요합니다. 다시 로그인해주세요.',
    403: '접근 권한이 없습니다.',
    404: '요청한 정보를 찾을 수 없습니다.',
    409: '이미 존재하는 정보입니다.',
    422: '입력한 정보를 확인해주세요.',
    429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    502: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
    503: '서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
  };

  return statusMessages[status] || defaultMessage || '오류가 발생했습니다. 다시 시도해주세요.';
}

/**
 * 네트워크 에러 메시지 반환
 */
export function getNetworkErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('timeout') || error.message.includes('Request timeout')) {
      return '요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.';
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return '네트워크 연결을 확인해주세요. 인터넷 연결이 불안정할 수 있습니다.';
    }
    if (error.message.includes('CORS')) {
      return '서버 연결에 문제가 있습니다. 관리자에게 문의해주세요.';
    }
  }
  return '네트워크 오류가 발생했습니다. 연결을 확인하고 다시 시도해주세요.';
}

/**
 * 에러 객체에서 사용자 친화적인 메시지 추출
 */
export function extractUserFriendlyMessage(error: unknown): string {
  if (error instanceof Error) {
    // ApiError인 경우
    if ('code' in error && typeof (error as { code?: ApiErrorCode }).code === 'string') {
      const apiError = error as { code?: ApiErrorCode; message: string };
      return getErrorMessage(apiError.code, apiError.message);
    }
    
    // HTTP 상태 코드가 있는 경우
    if ('status' in error && typeof (error as { status?: number }).status === 'number') {
      const httpError = error as { status?: number; message: string };
      if (httpError.status) {
        return getHttpErrorMessage(httpError.status, httpError.message);
      }
    }
    
    // 네트워크 에러인 경우
    if (error.message.includes('timeout') || 
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError')) {
      return getNetworkErrorMessage(error);
    }
    
    // 기본 에러 메시지
    return error.message;
  }
  
  return '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.';
}
