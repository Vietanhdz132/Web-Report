const { getConnection } = require('../../../config/db');

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
          SELECT * FROM WEB_HOME_TRAMMATLIENLAC_TVT
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
      tvt:row[4],
      siteScTotal: row[5],
      site2gSc: row[6],
      site3gSc: row[7],
      site4gSc: row[8],
      siteScTotalRate: row[9],
      site2gScRate: row[10],
      site3gScRate: row[11],
      site4gScRate: row[12],
      mllDuration: row[13],
      mllDurationRate: row[14],
      ucttTotal: row[15],
      uctt2g: row[16],
      uctt3g: row[17],
      uctt4g: row[18],
      powerRate: row[19],
      hardwareRate: row[20],
      transRate: row[21],
      mnkRate: row[22],
      thutu: row[23],
      nnCxdRate: row[24],
      nnChuaCoRate: row[25],
    }));

  } finally {
    await connection.close();
  }
}

module.exports = { getAllStats };
