// 테이블 확인 스크립트
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    console.log('데이터베이스 연결 중...');
    await client.connect();
    console.log('✅ 데이터베이스에 연결되었습니다.\n');
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('✅ 생성된 테이블:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    const expectedTables = ['check_in_out_logs', 'orders', 'reservations', 'rooms'];
    const createdTables = result.rows.map(row => row.table_name);
    const allCreated = expectedTables.every(table => createdTables.includes(table));
    
    console.log('');
    if (allCreated) {
      console.log('✅ 모든 테이블이 성공적으로 생성되었습니다!');
      console.log(`   총 ${result.rows.length}개 테이블`);
    } else {
      console.log('⚠️  일부 테이블이 누락되었을 수 있습니다.');
      console.log('   예상 테이블:', expectedTables.join(', '));
      console.log('   생성된 테이블:', createdTables.join(', '));
    }
  } catch (error) {
    console.error('❌ 오류 발생:');
    console.error(error.message);
    if (error.code) {
      console.error(`   코드: ${error.code}`);
    }
  } finally {
    await client.end();
    console.log('\n데이터베이스 연결을 종료했습니다.');
  }
}

checkTables();
