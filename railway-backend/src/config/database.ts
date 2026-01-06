import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  // 연결 풀 설정
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
  connectionTimeoutMillis: 10000, // 연결 타임아웃
});

// 연결 이벤트 핸들러
pool.on('connect', () => {
  console.log('Database client connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // 프로세스를 종료하지 않고 로그만 출력
  // 서버가 계속 실행되도록 함
});

export default pool;
