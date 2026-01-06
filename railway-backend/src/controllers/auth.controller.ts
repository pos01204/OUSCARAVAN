import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';

// TODO: 실제 데이터베이스에서 관리자 정보 조회
// 임시 관리자 계정 (프로덕션에서는 데이터베이스에서 조회)
const ADMIN_CREDENTIALS = {
  id: 'ouscaravan',
  password: '123456789a',
};

export async function login(req: Request, res: Response) {
  try {
    // 요청 로깅
    console.log('[AUTH] Login request received:', {
      timestamp: new Date().toISOString(),
      origin: req.headers.origin || 'no origin',
      userAgent: req.headers['user-agent'] || 'no user-agent',
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      body: {
        id: req.body.id ? 'provided' : 'missing',
        password: req.body.password ? 'provided' : 'missing',
      },
    });

    const { id, password } = req.body;

    // 입력 검증
    if (!id || !password) {
      console.log('[AUTH] Missing credentials');
      return res.status(400).json({
        error: 'ID and password are required',
        code: 'MISSING_CREDENTIALS',
      });
    }

    // 인증 확인
    if (id !== ADMIN_CREDENTIALS.id || password !== ADMIN_CREDENTIALS.password) {
      console.log('[AUTH] Invalid credentials:', {
        providedId: id,
        providedPasswordLength: password?.length || 0,
        expectedId: ADMIN_CREDENTIALS.id,
      });
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // JWT 토큰 생성
    const token = generateToken({
      id: ADMIN_CREDENTIALS.id,
      username: ADMIN_CREDENTIALS.id,
    });

    console.log('[AUTH] Login successful:', {
      id: ADMIN_CREDENTIALS.id,
      tokenLength: token.length,
      expiresIn: 604800,
    });

    res.json({
      token,
      expiresIn: 604800, // 7일 (초 단위)
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    if (error instanceof Error) {
      console.error('[AUTH] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
