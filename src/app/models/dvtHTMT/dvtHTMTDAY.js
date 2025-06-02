const { getConnection } = require('../../../config/db/oracleClient');

function formatDate(str) {
  if (!str) return null;
  const [day, month, year] = str.split('/');
  return `${day}-${month}-${year}`;
}

async function getAllStats(page = 1, pageSize = 50) {
  const offset = (page - 1) * pageSize;
  const connection = await getConnection();
  try {
    // Oracle phân trang kiểu này (ROWNUM + subquery):
    const query = `
      SELECT * FROM (
        SELECT a.*, ROWNUM rnum FROM (
          SELECT * FROM DVT_HTMT_2025_DAY
          WHERE TTML = 'Mien Bac'
          ORDER BY ID DESC
        ) a WHERE ROWNUM <= :maxRow
      )
      WHERE rnum > :minRow
    `;

    const binds = {
      maxRow: offset + pageSize,
      minRow: offset,
    };

    const result = await connection.execute(query, binds);

    return result.rows.map(row => ({
      id: row[0],
      date_id: row[1],
      date: row[2],
      ttml: row[3],
      dvt: row[4],
      tvt: row[5],
      total_cell: row[6],
      count_prb80: row[7],
      count_bh10: row[8],
      prb80_per: row[9],
      bh10_per: row[10],
    
    }));

  } finally {
    await connection.close();
  }
}

module.exports = { getAllStats };
