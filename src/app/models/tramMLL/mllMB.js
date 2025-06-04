const oracledb = require('oracledb');
const { getConnection } = require('../../../config/db/oracleClient');

async function getAllStats(page = 1, pageSize = 50) {
  const offset = (page - 1) * pageSize;
  const connection = await getConnection();

  try {
    const query = `
      SELECT * FROM (
        SELECT a.*, ROWNUM rnum FROM (
          SELECT 
            ID,
            TICKET_ID,
            SITE_ID,
            ALARM_NAME,
            TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY HH24:MI:SS') AS SDATE,
            TO_CHAR(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY HH24:MI:SS') AS EDATE,
            PROVINCE,
            DISTRICT,
            REGION,
            MA_TRUNG_TAM_XL,
            MA_PHONG_XL,
            MA_TO_XL,
            NETWORK,
            NN_CAP_1,
            NN_CAP_2,
            NN_CAP_3,
            TO_CHAR(TO_DATE(NGAY_TAO, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY HH24:MI:SS') AS NGAY_TAO,
            HE_THONG,
            CLEARED,
            TO_CHAR(TO_DATE(MD_SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY HH24:MI:SS') AS MD_SDATE,
            IS_REDUCE,

            -- Thêm cột thời gian mất liên lạc trong ngày (tính theo giây)
            (
              CASE 
                WHEN TRUNC(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM')) = TRUNC(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM')) 
                THEN 
                  (TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM') - TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM')) * 24 * 60 
                ELSE 
                  (TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS') 
                   - TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM')) * 24 * 60 
              END
            ) AS DURATION_IN_DAY

          FROM MLL_MB
          ORDER BY ID DESC
        ) a WHERE ROWNUM <= :maxRow
      )
      WHERE rnum > :minRow
    `;

    const binds = {
      maxRow: offset + pageSize,
      minRow: offset,
    };

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return result.rows.map(row => ({
      ID: row.ID,
      TICKET_ID: row.TICKET_ID,
      SITE_ID: row.SITE_ID,
      ALARM_NAME: row.ALARM_NAME,
      SDATE: row.SDATE,
      EDATE: row.EDATE,
      DURATION_IN_DAY: row.DURATION_IN_DAY, 
      PROVINCE: row.PROVINCE,
      DISTRICT: row.DISTRICT,
      REGION: row.REGION,
      MA_TRUNG_TAM_XL: row.MA_TRUNG_TAM_XL,
      MA_PHONG_XL: row.MA_PHONG_XL,
      MA_TO_XL: row.MA_TO_XL,
      NETWORK: row.NETWORK,
      NN_CAP_1: row.NN_CAP_1,
      NN_CAP_2: row.NN_CAP_2,
      NN_CAP_3: row.NN_CAP_3,
      NGAY_TAO: row.NGAY_TAO,
      HE_THONG: row.HE_THONG,
      CLEARED: row.CLEARED,
      MD_SDATE: row.MD_SDATE,
      IS_REDUCE: row.IS_REDUCE,
    }));
  } finally {
    await connection.close();
  }
}

async function getAverageDuration(filterType = 'year', batchSize = 10000, onBatch) {
  const connection = await getConnection();

  let groupByFormat;
  if (filterType === 'day') groupByFormat = 'DD/MM/YYYY';
  else if (filterType === 'month') groupByFormat = 'MM/YYYY';
  else if (filterType === 'year') groupByFormat = 'YYYY';
  else groupByFormat = 'DD/MM/YYYY';

  let offset = 0;
  let hasMore = true;
  const groupedData = {};

  try {
    while (hasMore) {
      const query = `
        SELECT * FROM (
          SELECT a.*, ROWNUM rnum FROM (
            SELECT
              TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), '${groupByFormat}') AS PERIOD,
              CASE 
                WHEN TRUNC(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM')) = TRUNC(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM')) 
                THEN 
                  (TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM') - TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM')) * 24 * 60
                ELSE 
                  (TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS') 
                   - TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM')) * 24 * 60
              END AS DURATION_MINUTES
            FROM MLL_MB
            ORDER BY ID
          ) a WHERE ROWNUM <= :maxRow
        )
        WHERE rnum > :minRow
      `;

      const binds = {
        maxRow: offset + batchSize,
        minRow: offset,
      };

      const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      const rows = result.rows;

      if (rows.length === 0) {
        hasMore = false;
        break;
      }

      for (const row of rows) {
        const period = row.PERIOD;
        const duration = row.DURATION_MINUTES;

        if (!groupedData[period]) {
          groupedData[period] = { sum: 0, count: 0 };
        }
        groupedData[period].sum += duration;
        groupedData[period].count += 1;
      }

      if (onBatch) {
        const batchSummary = Object.entries(groupedData).map(([period, data]) => ({
          PERIOD: period,
          AVG_DURATION_MINUTES: data.sum / data.count,
        }));
        await onBatch(batchSummary);
      }

      offset += rows.length;
    }

    return Object.entries(groupedData).map(([period, data]) => ({
      PERIOD: period,
      AVG_DURATION_MINUTES: data.sum / data.count,
    }));
  } finally {
    await connection.close();
  }
}



module.exports = { getAllStats, getAverageDuration };
