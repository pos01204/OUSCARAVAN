import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import guestRoutes from './routes/guest.routes';
import healthRoutes from './routes/health.routes';
import { errorHandler } from './middleware/error.middleware';
import pool from './config/database';
import { runMigrations } from './migrations/run-migrations';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// 미들웨어
// 쿠키 파서 (하이브리드 인증용)
app.use(cookieParser());

// CORS 설정 - Vercel 도메인 허용
const allowedOrigins = [
  'https://ouscaravan.vercel.app',
  'http://localhost:3000',
];

// Vercel 도메인 패턴 허용 (모든 Vercel 서브도메인)
const vercelPattern = /^https:\/\/ouscaravan.*\.vercel\.app$/;
const vercelProjectsPattern = /^https:\/\/ouscaravan-.*\.vercel\.app$/;

// 환경 변수에서 추가 도메인 허용
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
}

app.use(cors({
  origin: (origin, callback) => {
    // origin이 없으면 (같은 도메인 요청 등) 허용
    if (!origin) {
      return callback(null, true);
    }
    
    // 허용된 origin 목록 확인
    if (allowedOrigins.includes(origin)) {
      console.log('[CORS] Allowing origin from list:', origin);
      return callback(null, true);
    }
    
    // Vercel 도메인 패턴 확인
    if (vercelPattern.test(origin) || vercelProjectsPattern.test(origin)) {
      console.log('[CORS] Allowing Vercel origin:', origin);
      return callback(null, true);
    }
    
    // 개발 환경에서는 모든 origin 허용
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CORS] Allowing origin in development:', origin);
      return callback(null, true);
    }
    
    // 프로덕션에서 허용되지 않은 origin
    console.error('[CORS] Blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check - 루트 경로와 /health 모두 지원
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'OUSCARAVAN API',
    version: '1.0.0'
  });
});

// 라우트
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guest', guestRoutes);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    code: 'NOT_FOUND',
  });
});

// 에러 핸들러
app.use(errorHandler);

// 데이터베이스 연결 테스트 및 서버 시작
async function startServer() {
  try {
    // 서버를 먼저 시작 (Railway 헬스체크를 빠르게 응답하기 위해)
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://0.0.0.0:${PORT}/health`);
      console.log(`Server ready to accept connections`);
    });
    
    // 서버가 리스닝 상태인지 확인
    server.on('listening', () => {
      console.log('HTTP server is listening and ready');
    });
    
    server.on('error', (error: NodeJS.ErrnoException) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      }
      process.exit(1);
    });
    
    // 데이터베이스 연결 테스트 및 마이그레이션 실행 (비동기로, 서버 시작을 막지 않음)
    pool.connect()
      .then(async (client) => {
        console.log('Database connected successfully');
        client.release();
        
        // 마이그레이션 실행 (자동)
        try {
          await runMigrations();
        } catch (error) {
          console.error('Migration error (non-fatal):', error);
          // 마이그레이션 실패해도 서버는 계속 실행
        }
      })
      .catch((error) => {
        console.error('Database connection failed (non-fatal):', error);
        // 데이터베이스 연결 실패해도 서버는 계속 실행
        // Railway 헬스체크는 성공할 수 있음
      });
    
    // Graceful shutdown 처리
    const gracefulShutdown = async (signal: string) => {
      console.log(`${signal} signal received: closing HTTP server`);
      
      // 타임아웃 설정 (10초 후 강제 종료)
      const timeout = setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
      
      try {
        // HTTP 서버 종료
        server.close(() => {
          console.log('HTTP server closed');
          
          // 데이터베이스 풀 종료
          pool.end(() => {
            console.log('Database pool closed');
            clearTimeout(timeout);
            process.exit(0);
          });
        });
      } catch (error) {
        console.error('Error during graceful shutdown:', error);
        clearTimeout(timeout);
        process.exit(1);
      }
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // 프로세스가 종료되지 않도록 유지
    // Railway는 서버가 계속 실행 중이어야 함
    console.log('Server startup complete, keeping process alive');
    
  } catch (error) {
    console.error('Failed to start server:', error);
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

startServer();

export default app;
