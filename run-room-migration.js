// Railway PostgreSQL 룸 데이터 마이그레이션 실행 스크립트
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL 환경 변수가 설정되지 않았습니다.');
    console.error('PowerShell에서 다음과 같이 실행해보세요:');
    console.error('$env:DATABASE_URL="your_connection_string"; node run-room-migration.js');
    process.exit(1);
}

if (connectionString.includes('railway.internal')) {
    console.error('❌ [오류] 내부 네트워크 주소를 사용하고 계십니다.');
    console.error('   "postgres.railway.internal" 주소는 Railway 서버 내부에서만 접속 가능합니다.');
    console.error('');
    console.error('✅ 해결 방법:');
    console.error('   1. Railway 대시보드 -> PostgreSQL 서비스 -> "Connect" 탭으로 이동하세요.');
    console.error('   2. "Public Networking" 섹션에 있는 URL을 복사하세요.');
    console.error('      (보통 "roundhouse.proxy.rlwy.net" 등으로 끝나는 주소입니다)');
    console.error('   3. 복사한 Public URL을 사용하여 다시 실행해주세요.');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() {
    try {
        console.log('========================================');
        console.log('방 데이터 정규화(1호~10호) 마이그레이션 시작');
        console.log('========================================');
        console.log('사용 중인 마이그레이션 파일: 007_fix_room_duplication.sql');

        console.log('[1/3] 데이터베이스 연결 중...');
        await client.connect();
        console.log('✅ 데이터베이스 연결 성공');

        console.log('[2/3] SQL 파일 읽는 중...');
        // 007 파일 사용: 중복 에러 해결 버전
        const sqlPath = path.join(__dirname, 'railway-backend', 'migrations', '007_fix_room_duplication.sql');

        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL 파일을 찾을 수 없습니다: ${sqlPath}`);
        }
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('✅ SQL 파일 로드 완료');

        console.log('[3/3] SQL 실행 중...');
        await client.query(sql);
        console.log('✅ 마이그레이션 실행 완료!');

        // 검증 쿼리
        const res = await client.query(`
        SELECT name, capacity, status FROM rooms WHERE name ~ '^\\d+호$' ORDER BY CAST(SUBSTRING(name FROM '^(\\d+)') AS INTEGER)
    `);
        console.log('\n[현재 방 목록 확인]');
        console.table(res.rows);

    } catch (error) {
        console.error('❌ 마이그레이션 실패:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 데이터베이스 연결 종료');
    }
}

runMigration();
