import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || 500;
  const error = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';
  const details = err.details;

  // 에러 로깅 강화
  console.error('[ErrorHandler]', {
    status,
    error,
    code,
    details,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    // 프로덕션에서는 스택 트레이스 제외
    ...(process.env.NODE_ENV !== 'production' && err.stack && { stack: err.stack }),
  });

  // 프로덕션 환경에서는 내부 에러 상세 정보 숨김
  const isProduction = process.env.NODE_ENV === 'production';
  const responseError = isProduction && status === 500 
    ? 'Internal server error' 
    : error;

  res.status(status).json({
    error: responseError,
    code,
    ...(details && { details }),
    ...(process.env.NODE_ENV !== 'production' && { 
      timestamp: new Date().toISOString(),
      path: req.path,
    }),
  });
}
