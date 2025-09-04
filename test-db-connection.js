// test-db-connection.js
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔄 Testing database connection...');
  
  const config = {
    host: 'srv1637.hstgr.io', // atau '153.92.15.37'
    user: 'u644770248_9Wenw',
    password: 'Qlop12345_',
    database: 'u644770248_d1h1K',
    port: 3306,
    ssl: { rejectUnauthorized: false }
  };
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connection successful!');
    
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as server_time');
    console.log('📊 Test query result:', rows[0]);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔐 Username atau password salah');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('🗄️ Database tidak ditemukan');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🌐 Host tidak ditemukan - cek hostname');
    } else if (error.code === 'ER_HOST_NOT_PRIVILEGED') {
      console.log('🚫 IP tidak diizinkan - aktifkan Remote MySQL');
    }
  }
}

testConnection();