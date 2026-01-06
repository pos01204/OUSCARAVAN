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

  console.error('Error:', {
    status,
    error,
    code,
    details,
    path: req.path,
    method: req.method,
  });

  res.status(status).json({
    error,
    code,
    ...(details && { details }),
  });
}
