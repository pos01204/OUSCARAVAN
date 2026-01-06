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
    const { id, password } = req.body;

    // 입력 검증
    if (!id || !password) {
      return res.status(400).json({
        error: 'ID and password are required',
        code: 'MISSING_CREDENTIALS',
      });
    }

    // 인증 확인
    if (id !== ADMIN_CREDENTIALS.id || password !== ADMIN_CREDENTIALS.password) {
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

    res.json({
      token,
      expiresIn: 604800, // 7일 (초 단위)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
