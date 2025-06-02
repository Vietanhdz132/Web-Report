const oracledb = require('oracledb');

const dbConfig = {
  user: 'mlmb',
  password: 'mlmb@811',
  connectString: '10.46.42.79:1521/FREEPDB1',
};

let pool;

async function connect() {
  if (!pool) {
    try {
      pool = await oracledb.createPool({
        ...dbConfig,
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 1,
      });
      console.log('✅ Oracle DB connection pool created');
    } catch (err) {
      console.error('❌ Error creating Oracle DB pool:', err);
      throw err;
    }
  }
  return pool;
}

// Hàm lấy connection từ pool
async function getConnection() {
  if (!pool) {
    await connect();
  }
  return await pool.getConnection();
}

// Hàm đóng pool khi app shutdown (nếu cần)
async function closePool() {
  if (pool) {
    try {
      await pool.close(10); // timeout 10s
      console.log('🔒 Oracle DB pool closed');
    } catch (err) {
      console.error('❌ Error closing Oracle DB pool:', err);
    }
  }
}

module.exports = {
  connect,
  getConnection,
  closePool,
};
