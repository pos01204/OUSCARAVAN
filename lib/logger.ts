/**
 * 로깅 유틸리티 함수
 * 향후 Sentry 등 외부 로깅 서비스로 전송 가능하도록 구조화
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

/**
 * 에러 로깅
 */
export function logError(
  message: string,
  error?: Error | unknown,
  context?: LogContext
): void {
  const logData = {
    level: 'error' as LogLevel,
    message,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    context,
    timestamp: new Date().toISOString(),
  };

  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', logData);
  }

  // 향후 Sentry 등으로 전송
  // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  //   Sentry.captureException(error, { extra: context });
  // }
}

/**
 * 경고 로깅
 */
export function logWarn(
  message: string,
  context?: LogContext
): void {
  const logData = {
    level: 'warn' as LogLevel,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.warn('[WARN]', logData);
  }
}

/**
 * 정보 로깅
 */
export function logInfo(
  message: string,
  context?: LogContext
): void {
  const logData = {
    level: 'info' as LogLevel,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.info('[INFO]', logData);
  }
}

/**
 * 디버그 로깅
 */
export function logDebug(
  message: string,
  context?: LogContext
): void {
  const logData = {
    level: 'debug' as LogLevel,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.debug('[DEBUG]', logData);
  }
}
