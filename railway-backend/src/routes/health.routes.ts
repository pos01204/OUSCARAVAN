import express from 'express';
import pool from '../config/database';

const router = express.Router();

/**
 * 상세 헬스체크 - 데이터베이스 연결 상태 포함
 */
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'OUSCARAVAN API',
    version: '1.0.0',
    database: {
      connected: false,
      error: null as string | null,
    },
  };

  // 데이터베이스 연결 테스트
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    health.database.connected = true;
  } catch (error) {
    health.database.connected = false;
    health.database.error = error instanceof Error ? error.message : String(error);
    health.status = 'degraded'; // 데이터베이스 연결 실패해도 서버는 실행 중
  }

  res.json(health);
});

export default router;
