const { getConnection } = require('../../config/db');

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
          SELECT * FROM WEB_HOME_TRAMMATLIENLAC
          WHERE NOC = 'Mien Bac'
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
      ngay: formatDate(row[1]),
      noc: row[2],
      siteScTotal: row[3],
      site2gSc: row[4],
      site3gSc: row[5],
      site4gSc: row[6],
      siteScTotalRate: row[7],
      site2gScRate: row[8],
      site3gScRate: row[9],
      site4gScRate: row[10],
      mllDuration: row[11],
      mllDurationRate: row[12],
      ucttTotal: row[13],
      uctt2g: row[14],
      uctt3g: row[15],
      uctt4g: row[16],
      powerRate: row[17],
      hardwareRate: row[18],
      transRate: row[19],
      mnkRate: row[20],
      thutu: row[21],
      nnCxdRate: row[22],
      nnChuaCoRate: row[23],
    }));

  } finally {
    await connection.close();
  }
}

module.exports = { getAllStats };
