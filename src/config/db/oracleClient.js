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
        poolMax: 20,
        poolIncrement: 5,
        poolTimeout: 60,      // Release idle connections after 60s
        stmtCacheSize: 0
      });
      console.log('✅ Oracle DB connection pool created');
    } catch (err) {
      console.error('❌ Error creating Oracle DB pool:', err);
      throw err;
    }
  }
  return pool;
}

async function getConnection() {
  if (!pool) {
    await connect();
  }
  return await pool.getConnection();
}

async function closePool() {
  if (pool) {
    try {
      await pool.close(10);
      console.log('🔒 Oracle DB pool closed');
    } catch (err) {
      console.error('❌ Error closing Oracle DB pool:', err);
    }
  }
}

// Dùng cho các query đơn giản (tự đóng connection)
async function executeQuery(sql, binds = {}, options = {}) {
  const connection = await getConnection();
  try {
    const result = await connection.execute(sql, binds, options);
    return result;
  } catch (err) {
    console.error('❌ Query execution error:', err);
    throw err;
  } finally {
    try {
      await connection.close();
    } catch (closeErr) {
      console.error('❌ Error closing connection:', closeErr);
    }
  }
}

// === Transaction API ===

// Bắt đầu một transaction: trả về connection đang mở
async function beginTransaction() {
  const connection = await getConnection();
  try {
    await connection.execute('BEGIN'); // optional
    return connection;
  } catch (err) {
    await connection.close();
    throw err;
  }
}

// Commit transaction và đóng connection
async function commitTransaction(connection) {
  try {
    await connection.commit();
  } finally {
    await connection.close();
  }
}

// Rollback transaction và đóng connection
async function rollbackTransaction(connection) {
  try {
    await connection.rollback();
  } finally {
    await connection.close();
  }
}

module.exports = {
  connect,
  getConnection,
  closePool,
  executeQuery,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
};
