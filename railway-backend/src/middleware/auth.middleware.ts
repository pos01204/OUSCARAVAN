import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

/**
 * 하이브리드 인증 미들웨어
 * 웹뷰 호환을 위해 두 가지 방식 지원:
 * 1순위: Authorization 헤더 (Bearer 토큰) - 웹뷰에서 안정적
 * 2순위: 쿠키 (admin-token) - 일반 브라우저 폴백
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;
  let tokenSource: string = 'none';

  // 1. Authorization 헤더에서 토큰 추출 (우선)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
    tokenSource = 'header';
    console.log('[Auth] Token extracted from Authorization header');
  }
  
  // 2. 쿠키에서 토큰 추출 (폴백)
  if (!token && req.cookies && req.cookies['admin-token']) {
    token = req.cookies['admin-token'];
    tokenSource = 'cookie';
    console.log('[Auth] Token extracted from cookie (fallback)');
  }

  // 토큰 없음
  if (!token) {
    console.log('[Auth] No token found in request');
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다.',
    });
  }
  
  // 토큰 검증
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    console.log(`[Auth] Token verified successfully (source: ${tokenSource}, user: ${decoded.username})`);
    next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error instanceof Error ? error.message : error);
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
      message: '인증 토큰이 유효하지 않습니다. 다시 로그인해주세요.',
    });
  }
}

/**
 * n8n API Key 인증 (자동화용)
 * X-API-Key 헤더로 API 키 전달
 */
export function authenticateApiKey(req: AuthRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.N8N_API_KEY;

  // API Key가 설정되지 않은 경우
  if (!validApiKey) {
    console.error('[Auth] N8N_API_KEY environment variable not configured');
    return res.status(500).json({
      error: 'Server configuration error',
      code: 'CONFIG_ERROR',
      message: 'API Key 인증이 설정되지 않았습니다.',
    });
  }

  // API Key 검증
  if (apiKey === validApiKey) {
    console.log('[Auth] API Key authentication successful');
    next();
  } else {
    console.log('[Auth] API Key authentication failed');
    return res.status(401).json({
      error: 'Invalid API key',
      code: 'INVALID_API_KEY',
      message: 'API 키가 유효하지 않습니다.',
    });
  }
}

/**
 * 사용자 인증 또는 API Key 인증 (둘 중 하나)
 * - X-API-Key 헤더가 있으면 API Key 인증 시도 (n8n 자동화용)
 * - 그 외에는 사용자 인증 (관리자 웹 접근)
 */
export function authenticateOrApiKey(req: AuthRequest, res: Response, next: NextFunction) {
  // API Key가 있으면 API Key 인증 시도
  if (req.headers['x-api-key']) {
    console.log('[Auth] X-API-Key header detected, using API Key authentication');
    return authenticateApiKey(req, res, next);
  }
  
  // 그 외에는 사용자 인증 (하이브리드: 헤더 우선, 쿠키 폴백)
  console.log('[Auth] Using user authentication (hybrid: header/cookie)');
  return authenticate(req, res, next);
}

/**
 * 선택적 인증 미들웨어
 * 인증이 있으면 사용자 정보를 설정하고, 없어도 요청을 계속 진행
 */
export function optionalAuthenticate(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // Authorization 헤더에서 토큰 추출
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  // 쿠키에서 토큰 추출 (폴백)
  if (!token && req.cookies && req.cookies['admin-token']) {
    token = req.cookies['admin-token'];
  }

  // 토큰이 있으면 검증 시도
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      console.log(`[Auth] Optional auth: user authenticated (${decoded.username})`);
    } catch (error) {
      // 토큰이 유효하지 않아도 계속 진행 (선택적 인증)
      console.log('[Auth] Optional auth: token invalid, continuing without auth');
    }
  } else {
    console.log('[Auth] Optional auth: no token, continuing without auth');
  }

  next();
}
