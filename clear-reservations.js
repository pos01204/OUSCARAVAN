/**
 * 예약 데이터 초기화 스크립트
 * 
 * 사용법:
 * 1. Railway 대시보드 → PostgreSQL 서비스 → "Connect" 버튼 클릭
 * 2. "Public Network" 탭 → "Connection URL" 복사
 * 3. PowerShell에서 실행:
 *    $env:DATABASE_URL="postgresql://postgres:비밀번호@host:port/database"
 *    node clear-reservations.js
 * 
 * 또는 PowerShell 스크립트 사용:
 *    .\clear-reservations.ps1
 */

const { Pool } = require('pg');

// DATABASE_URL 환경 변수 확인
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL 환경 변수가 설정되지 않았습니다.');
  console.log('\n📋 설정 방법:');
  console.log('1. Railway 대시보드 → PostgreSQL 서비스');
  console.log('2. "Connect" 버튼 클릭');
  console.log('3. "Public Network" 탭 선택');
  console.log('4. "Connection URL" 복사');
  console.log('5. PowerShell에서 실행:');
  console.log('   $env:DATABASE_URL="postgresql://postgres:비밀번호@host:port/database"');
  console.log('   node clear-reservations.js');
  console.log('\n💡 또는 PowerShell 스크립트 사용:');
  console.log('   .\clear-reservations.ps1');
  process.exit(1);
}

// 내부 네트워크 주소 체크 및 경고
if (process.env.DATABASE_URL.includes('railway.internal')) {
  console.error('❌ 내부 네트워크 주소를 사용하고 있습니다.');
  console.log('\n⚠️  로컬에서 실행할 때는 공개 네트워크 주소를 사용해야 합니다.');
  console.log('\n📋 올바른 설정 방법:');
  console.log('1. Railway 대시보드 → PostgreSQL 서비스');
  console.log('2. "Connect" 버튼 클릭');
  console.log('3. "Public Network" 탭 선택 (Internal Network 아님!)');
  console.log('4. "Connection URL" 복사');
  console.log('5. PowerShell에서 실행:');
  console.log('   $env:DATABASE_URL="postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:포트/railway"');
  console.log('   node clear-reservations.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

async function clearReservations() {
  let client;
  
  try {
    console.log('🔌 데이터베이스 연결 중...');
    client = await pool.connect();
    console.log('✅ 데이터베이스 연결 성공\n');

    // 현재 예약 개수 확인
    const countResult = await client.query('SELECT COUNT(*) as count FROM reservations');
    const currentCount = parseInt(countResult.rows[0].count, 10);
    console.log(`📊 현재 예약 개수: ${currentCount}건`);

    if (currentCount === 0) {
      console.log('ℹ️  삭제할 예약이 없습니다.');
      return;
    }

    // 예약 데이터 삭제
    console.log('\n🗑️  예약 데이터 삭제 중...');
    const deleteResult = await client.query('DELETE FROM reservations');
    console.log(`✅ ${deleteResult.rowCount}건의 예약이 삭제되었습니다.`);

    // 삭제 후 확인
    const finalCountResult = await client.query('SELECT COUNT(*) as count FROM reservations');
    const finalCount = parseInt(finalCountResult.rows[0].count, 10);
    console.log(`📊 삭제 후 예약 개수: ${finalCount}건`);

    // 방 데이터 확인 (삭제되지 않았는지 확인)
    const roomCountResult = await client.query('SELECT COUNT(*) as count FROM rooms');
    const roomCount = parseInt(roomCountResult.rows[0].count, 10);
    console.log(`🏠 방 데이터 개수: ${roomCount}개 (유지됨)`);

    console.log('\n✅ 예약 데이터 초기화 완료!');
    console.log('💡 이제 n8n 워크플로우를 통해 새로운 예약 데이터를 수신할 수 있습니다.');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error('상세 오류:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// 실행
clearReservations();
