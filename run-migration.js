// Railway PostgreSQL 마이그레이션 실행 스크립트 (Node.js)
// psql 설치 없이 Node.js를 사용하여 SQL 실행

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Railway DATABASE_URL 환경 변수 사용
// Railway CLI를 사용하는 경우: railway run node run-migration.js
// 또는 직접 실행: DATABASE_URL="postgresql://..." node run-migration.js
let connectionString = process.env.DATABASE_URL;

// 내부 네트워크 주소를 공개 네트워크 주소로 변환
if (connectionString && connectionString.includes('railway.internal')) {
  console.log('⚠️  내부 네트워크 주소를 감지했습니다.');
  console.log('   공개 네트워크 주소를 사용해야 합니다.');
  console.log('');
  console.log('해결 방법:');
  console.log('  1. Railway 대시보드 → Postgres → Connect → Public Network');
  console.log('  2. Connection URL을 복사하여 아래 명령어로 실행:');
  console.log('     DATABASE_URL="postgresql://..." node run-migration.js');
  console.log('');
  console.log('또는 Railway Connect 다이얼로그에서 제공하는 Connection URL을 사용하세요.');
  connectionString = null;
}

if (!connectionString) {
  console.error('❌ DATABASE_URL 환경 변수가 설정되지 않았거나 내부 네트워크 주소입니다.');
  console.error('');
  console.error('사용 방법:');
  console.error('  1. Railway Connect 다이얼로그에서 Connection URL 복사:');
  console.error('     Railway 대시보드 → Postgres → Connect → Public Network');
  console.error('     Connection URL 복사');
  console.error('');
  console.error('  2. PowerShell에서 실행:');
  console.error('     $env:DATABASE_URL="postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway"');
  console.error('     node run-migration.js');
  console.error('');
  console.error('  3. 또는 한 줄로 실행:');
  console.error('     $env:DATABASE_URL="postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway"; node run-migration.js');
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
    console.log('Railway PostgreSQL 마이그레이션 실행');
    console.log('========================================');
    console.log('');

    // 데이터베이스 연결
    console.log('[1/3] 데이터베이스 연결 중...');
    await client.connect();
    console.log('✅ 데이터베이스에 연결되었습니다.');
    console.log('');

    // SQL 파일 읽기
    console.log('[2/3] SQL 파일 읽는 중...');
    const sqlFile = path.join(__dirname, 'MIGRATION_SQL_COMPLETE.sql');
    
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL 파일을 찾을 수 없습니다: ${sqlFile}`);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('✅ SQL 파일을 읽었습니다.');
    console.log('');

    // SQL 실행
    console.log('[3/3] 마이그레이션 실행 중...');
    await client.query(sql);
    console.log('✅ 마이그레이션이 완료되었습니다!');
    console.log('');

    // 테이블 확인
    console.log('생성된 테이블 확인 중...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('');
    console.log('✅ 생성된 테이블:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    const expectedTables = ['check_in_out_logs', 'orders', 'reservations', 'rooms'];
    const createdTables = result.rows.map(row => row.table_name);
    const allCreated = expectedTables.every(table => createdTables.includes(table));

    if (allCreated) {
      console.log('');
      console.log('✅ 모든 테이블이 성공적으로 생성되었습니다!');
    } else {
      console.log('');
      console.log('⚠️  일부 테이블이 누락되었을 수 있습니다.');
      console.log('   예상 테이블:', expectedTables.join(', '));
    }

  } catch (error) {
    console.error('');
    console.error('❌ 오류 발생:');
    console.error(error.message);
    if (error.code) {
      console.error(`   코드: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('');
    console.log('데이터베이스 연결을 종료했습니다.');
  }
}

runMigration();
