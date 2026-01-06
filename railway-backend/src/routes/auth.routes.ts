import express from 'express';
// TODO: auth.controller.ts 구현 필요
// import { login } from '../controllers/auth.controller';

const router = express.Router();

// TODO: 컨트롤러 구현 후 주석 해제
// router.post('/login', login);

// 임시 구현 (개발용)
router.post('/login', (req, res) => {
  const { id, password } = req.body;
  
  // TODO: 실제 인증 로직 구현
  // 임시 관리자 계정 (프로덕션에서는 데이터베이스에서 조회)
  if (id === 'ouscaravan' && password === '123456789a') {
    // TODO: JWT 토큰 생성
    res.json({
      token: 'temp-admin-token',
      expiresIn: 604800,
    });
  } else {
    res.status(401).json({
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS',
    });
  }
});

export default router;
