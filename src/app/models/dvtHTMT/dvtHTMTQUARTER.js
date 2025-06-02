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
          SELECT * FROM DVT_HTMT_2025_QUARTER
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
      quarter_id: row[1],
      ttml: row[2],
      dvt: row[3],
      tvt: row[4],
      total_cell: row[5],
      count_prb80: row[6],
      count_bh10: row[7],
      prb80_per: row[8],
      bh10_per: row[9],
    
    }));

  } finally {
    await connection.close();
  }
}

module.exports = { getAllStats };
