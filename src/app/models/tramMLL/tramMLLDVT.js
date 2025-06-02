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
          SELECT * FROM WEB_HOME_TRAMMATLIENLAC_DVT
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
      dvt:row[3],
      siteScTotal: row[4],
      site2gSc: row[5],
      site3gSc: row[6],
      site4gSc: row[7],
      siteScTotalRate: row[8],
      site2gScRate: row[9],
      site3gScRate: row[10],
      site4gScRate: row[11],
      mllDuration: row[12],
      mllDurationRate: row[13],
      ucttTotal: row[14],
      uctt2g: row[15],
      uctt3g: row[16],
      uctt4g: row[17],
      powerRate: row[18],
      hardwareRate: row[19],
      transRate: row[20],
      mnkRate: row[21],
      thutu: row[22],
      nnCxdRate: row[23],
      nnChuaCoRate: row[24],
    }));

  } finally {
    await connection.close();
  }
}

module.exports = { getAllStats };
