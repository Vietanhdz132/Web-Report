const oracledb = require('oracledb');
const { getConnection } = require('../../../config/db/oracleClient');
const { executeQuery } = require('../../../config/db/oracleClient');

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
            CASE MA_PHONG_XL
              WHEN N'DVT_Ha_Noi_1' THEN N'ĐVT Hà Nội 1'
              WHEN N'DVT_Ha_Noi_2' THEN N'ĐVT Hà Nội 2'
              WHEN N'DVT_Hai_Phong' THEN N'ĐVT Hải Phòng'
              WHEN N'DVT_Nam_Dinh' THEN N'ĐVT Nam Định'
              WHEN N'DVT_Nghe_An' THEN N'ĐVT Nghệ An'
              WHEN N'DVT_Thai_Nguyen' THEN N'ĐVT Thái Nguyên'
              WHEN N'DVT_Vinh_Phuc' THEN N'ĐVT Vĩnh Phúc'
              ELSE N'Khác'
            END AS DVT,
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

            -- Tổng thời gian mất liên lạc trong ngày SDATE
            (
              GREATEST(
                LEAST(
                  NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                      TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')
                )
                - TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                0
              ) * 24 * 60
            ) AS DURATION_IN_DAY,

            -- Thời gian ban ngày: 05:00–22:00 cùng ngày SDATE
            (
              GREATEST(
                LEAST(
                  NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                      TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 22:00:00', 'DD/MM/YYYY HH24:MI:SS')
                )
                - GREATEST(
                    TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                    TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 05:00:00', 'DD/MM/YYYY HH24:MI:SS')
                  ),
                0
              ) * 24 * 60
            ) AS DURATION_DAYTIME,

            -- Thời gian ban đêm: 00:00–05:00 và 22:00–23:59:59 cùng ngày SDATE
            (
              GREATEST(
                LEAST(
                  NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                      TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 05:00:00', 'DD/MM/YYYY HH24:MI:SS')),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 05:00:00', 'DD/MM/YYYY HH24:MI:SS')
                )
                - GREATEST(
                    TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                    TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 00:00:00', 'DD/MM/YYYY HH24:MI:SS')
                  ),
                0
              )
              +
              GREATEST(
                LEAST(
                  NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                      TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')
                )
                - GREATEST(
                    TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                    TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 22:00:00', 'DD/MM/YYYY HH24:MI:SS')
                  ),
                0
              )
            ) * 24 * 60 AS DURATION_NIGHTTIME

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
      DURATION_DAYTIME: row.DURATION_DAYTIME,
      DURATION_NIGHTTIME: row.DURATION_NIGHTTIME,
      DVT: row.DVT,
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

async function getSlicerOptionsAC() {
  const query = `
    SELECT DISTINCT
      DEPT AS DVT,
      TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'YYYY') AS YEAR,
      TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'MM') AS MONTH,
      TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD') AS DAY
    FROM CANHBAO_MD_MB
    WHERE SDATE IS NOT NULL
  `;

  const result = await executeQuery(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
  const rows = result.rows;

  const dvtSet = new Set();
  const dateTree = {};

  for (const row of rows) {
    const { DVT, YEAR, MONTH, DAY } = row;
    if (DVT && DVT !== 'TTML_MB_Phòng vô tuyến') {
      dvtSet.add(DVT);
    }


    if (YEAR && MONTH && DAY) {
      const y = YEAR;
      const m = MONTH.padStart(2, '0');
      const d = DAY.padStart(2, '0');

      if (!dateTree[y]) dateTree[y] = {};
      if (!dateTree[y][m]) dateTree[y][m] = new Set();

      dateTree[y][m].add(d);
    }
  }

  for (const y in dateTree) {
    for (const m in dateTree[y]) {
      dateTree[y][m] = [...dateTree[y][m]].sort();
    }
  }

  return {
    DVT: [...dvtSet].sort((a, b) => a.localeCompare(b, 'vi')),
    DATE_TREE: dateTree,
  };
}



async function getAverageDurationAC({ dvt, year, month, day, onBatch }) {
  const connection = await oracledb.getConnection();
  try {
    let groupByFormat = 'YYYY';
    if (day) {
      groupByFormat = 'YYYY-MM-DD';
    } else if (month) {
      groupByFormat = 'YYYY-MM';
    }

    let offset = 0;
    let hasMore = true;
    const groupedData = {};
    const batchSize = 500000

    const sql = `
      SELECT
        IP_ADDRESS,
        SITEID,
        CELLID,
        ALARM_NAME,
        TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY HH24:MI:SS') AS SDATE,
        TO_CHAR(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY HH24:MI:SS') AS EDATE,
        TEAM,
        DEPT AS DVT,
        PROVINCE,
        DISTRICT,
        REGION,
        NETWORK,
        TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), '${groupByFormat}') AS PERIOD,
        
        -- Tổng thời gian mất điện trong ngày SDATE
        (
          GREATEST(
            LEAST(
              NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')),
              TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')
            )
            - TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
            0
          ) * 24 * 60
        ) AS DURATION_IN_DAY,

        -- Thời gian ban ngày: 05:00–22:00 cùng ngày SDATE
        (
          GREATEST(
            LEAST(
              NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')),
              TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 22:00:00', 'DD/MM/YYYY HH24:MI:SS')
            )
            - GREATEST(
                TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 05:00:00', 'DD/MM/YYYY HH24:MI:SS')
              ),
            0
          ) * 24 * 60
        ) AS DURATION_DAYTIME,

        -- Thời gian ban đêm: 00:00–05:00 và 22:00–23:59:59 cùng ngày SDATE
        (
          GREATEST(
            LEAST(
              NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 05:00:00', 'DD/MM/YYYY HH24:MI:SS')),
              TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 05:00:00', 'DD/MM/YYYY HH24:MI:SS')
            )
            - GREATEST(
                TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 00:00:00', 'DD/MM/YYYY HH24:MI:SS')
              ),
            0
          )
          +
          GREATEST(
            LEAST(
              NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')),
              TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')
            )
            - GREATEST(
                TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 22:00:00', 'DD/MM/YYYY HH24:MI:SS')
              ),
            0
          )
        ) * 24 * 60 AS DURATION_NIGHTTIME

        FROM CANHBAO_MD_MB
        WHERE 1=1
        AND (:dvt IS NULL OR DEPT = :dvt)
        AND (:year IS NULL OR TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'YYYY') = :year)
        AND (:month IS NULL OR TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'MM') = :month)
        AND (:day IS NULL OR TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD') = :day)
      ORDER BY DVT, PERIOD
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

      while (hasMore) {
        const binds = { dvt, year, month, day, offset, limit: batchSize };
  
        const result = await connection.execute(sql, binds, {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
          maxRows: batchSize,
          fetchArraySize: batchSize
        });
  
        const rows = result.rows;
  
        if (rows.length === 0) break;
  
        for (const row of rows) {
          const period = row.PERIOD;
          const duration = row.DURATION_IN_DAY || 0;
          const duration_daytime = row.DURATION_DAYTIME || 0;
          const duration_nighttime = row.DURATION_NIGHTTIME || 0;
  
          const key = dvt ? `${dvt}_${period}` : period;
          const dvtLabel = dvt || 'Mạng lưới miền Bắc';
  
          if (!groupedData[key]) {
            groupedData[key] = {
              dvt: dvtLabel,
              period,
              sum_total: 0,
              sum_daytime: 0,
              sum_nighttime: 0,
              count: 0
            };
          }
  
          groupedData[key].sum_total += duration;
          groupedData[key].sum_daytime += duration_daytime;
          groupedData[key].sum_nighttime += duration_nighttime;
          groupedData[key].count += 1;
        }
  
        if (onBatch) {
          const batchSummary = Object.values(groupedData).map(data => {
            const parts = data.period.split('-');
            let formattedPeriod = '';
            if (parts.length === 1) formattedPeriod = `Năm ${parts[0]}`;
            else if (parts.length === 2) formattedPeriod = `Tháng ${parts[1]} năm ${parts[0]}`;
            else if (parts.length === 3) formattedPeriod = `Ngày ${parts[2]} tháng ${parts[1]} năm ${parts[0]}`;
  
            return {
              DVT: data.dvt,
              PERIOD: formattedPeriod,
              AVG_DURATION_TOTAL: data.sum_total / data.count,
              AVG_DURATION_DAYTIME: data.sum_daytime / data.count,
              AVG_DURATION_NIGHTTIME: data.sum_nighttime / data.count,
            };
          });
          await onBatch(batchSummary);
        }
  
        offset += rows.length;
        if (rows.length < batchSize) hasMore = false;
      }
  
      return Object.values(groupedData).map(data => {
        const parts = data.period.split('-');
        let formattedPeriod = '';
        if (parts.length === 1) formattedPeriod = `Năm ${parts[0]}`;
        else if (parts.length === 2) formattedPeriod = `Tháng ${parts[1]} năm ${parts[0]}`;
        else if (parts.length === 3) formattedPeriod = `Ngày ${parts[2]} tháng ${parts[1]} năm ${parts[0]}`;
  
        return {
          DVT: data.dvt,
          PERIOD: formattedPeriod,
          AVG_DURATION_TOTAL: data.sum_total / data.count,
          AVG_DURATION_DAYTIME: data.sum_daytime / data.count,
          AVG_DURATION_NIGHTTIME: data.sum_nighttime / data.count,
        };
      });
  
    } finally {
      await connection.close();
    }
  }


async function getAverageDurationDetailAC({ dvt, year, month, day, onBatch }) {
  const connection = await oracledb.getConnection();

    try {
      let groupByFormat = 'YYYY';
      if (day) {
        groupByFormat = 'YYYY-MM-DD';
      } else if (month) {
        groupByFormat = 'YYYY-MM';
      }

      let offset = 0;
      let hasMore = true;
      const groupedData = {};
      const batchSize = 500000

      const sql = `
        SELECT
          IP_ADDRESS,
          SITEID,
          CELLID,
          ALARM_NAME,
          TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY HH24:MI:SS') AS SDATE,
          TO_CHAR(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY HH24:MI:SS') AS EDATE,
          TEAM,
          DEPT AS DVT,
          PROVINCE,
          DISTRICT,
          REGION,
          NETWORK,

          TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), '${groupByFormat}') AS PERIOD,
          
          -- Tổng thời gian mất điện trong ngày SDATE
          (
            GREATEST(
              LEAST(
                NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                    TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')),
                TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')
              )
              - TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
              0
            ) * 24 * 60
          ) AS DURATION_IN_DAY,

          -- Thời gian ban ngày: 05:00–22:00 cùng ngày SDATE
          (
            GREATEST(
              LEAST(
                NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                    TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')),
                TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 22:00:00', 'DD/MM/YYYY HH24:MI:SS')
              )
              - GREATEST(
                  TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 05:00:00', 'DD/MM/YYYY HH24:MI:SS')
                ),
              0
            ) * 24 * 60
          ) AS DURATION_DAYTIME,

          -- Thời gian ban đêm: 00:00–05:00 và 22:00–23:59:59 cùng ngày SDATE
          (
            GREATEST(
              LEAST(
                NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                    TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 05:00:00', 'DD/MM/YYYY HH24:MI:SS')),
                TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 05:00:00', 'DD/MM/YYYY HH24:MI:SS')
              )
              - GREATEST(
                  TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 00:00:00', 'DD/MM/YYYY HH24:MI:SS')
                ),
              0
            )
            +
            GREATEST(
              LEAST(
                NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                    TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')),
                TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')
              )
              - GREATEST(
                  TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 22:00:00', 'DD/MM/YYYY HH24:MI:SS')
                ),
              0
            )
          ) * 24 * 60 AS DURATION_NIGHTTIME

          FROM CANHBAO_MD_MB
          WHERE 1=1
          AND (:dvt IS NULL OR DEPT = :dvt)
          AND (:year IS NULL OR TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'YYYY') = :year)
          AND (:month IS NULL OR TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'MM') = :month)
          AND (:day IS NULL OR TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD') = :day)
        ORDER BY DVT, PERIOD
        OFFSET :offset ROWS FETCH NEXT :batchSize ROWS ONLY

        
        
      `;

        while (hasMore) {
          const binds = { dvt, year, month, day, offset, batchSize };

          const result = await connection.execute(sql, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
          });

          const rows = result.rows;

          if (rows.length === 0) {
            hasMore = false;
            break;
          }

          for (const row of rows) {
              const period = row.PERIOD;
              const dvt = row.DVT;
              const key = `${dvt}_${period}`; // Dùng key này để gộp, nhưng kết quả sẽ tách DVT và PERIOD ra riêng

              const duration = row.DURATION_IN_DAY || 0;
              const duration_daytime = row.DURATION_DAYTIME || 0;
              const duration_nighttime = row.DURATION_NIGHTTIME || 0;

              if (!groupedData[key]) {
                groupedData[key] = {
                  dvt,
                  period,
                  sum_total: 0,
                  sum_daytime: 0,
                  sum_nighttime: 0,
                  count: 0,
                };
              }

              groupedData[key].sum_total += duration;
              groupedData[key].sum_daytime += duration_daytime;
              groupedData[key].sum_nighttime += duration_nighttime;
              groupedData[key].count += 1;
            }

          if (onBatch) {
          const batchSummary = Object.values(groupedData).map(data => {
            const parts = data.period.split('-');
            let formattedPeriod = '';

            if (parts.length === 1) {
              formattedPeriod = `Năm ${parts[0]}`;
            } else if (parts.length === 2) {
              formattedPeriod = `Tháng ${parts[1]} năm ${parts[0]}`;
            } else if (parts.length === 3) {
              formattedPeriod = `Ngày ${parts[2]} tháng ${parts[1]} năm ${parts[0]}`;
            }

            return {
              DVT: data.dvt,
              PERIOD: formattedPeriod,
              AVG_DURATION_TOTAL: data.sum_total / data.count,
              AVG_DURATION_DAYTIME: data.sum_daytime / data.count,
              AVG_DURATION_NIGHTTIME: data.sum_nighttime / data.count,
            };
          });
          await onBatch(batchSummary);
        }

        offset += rows.length;
        if (rows.length < batchSize) {
          hasMore = false;
        }
      }

      return Object.values(groupedData).map(data => {
        const parts = data.period.split('-');
        let formattedPeriod = '';

        if (parts.length === 1) {
          formattedPeriod = `Năm ${parts[0]}`;
        } else if (parts.length === 2) {
          formattedPeriod = `Tháng ${parts[1]} năm ${parts[0]}`;
        } else if (parts.length === 3) {
          formattedPeriod = `Ngày ${parts[2]} tháng ${parts[1]} năm ${parts[0]}`;
        }

        return {
          DVT: data.dvt,
          PERIOD: formattedPeriod,
          AVG_DURATION_TOTAL: data.sum_total / data.count,
          AVG_DURATION_DAYTIME: data.sum_daytime / data.count,
          AVG_DURATION_NIGHTTIME: data.sum_nighttime / data.count,
        };
      });

  } finally {
    await connection.close();
  }
}

async function getAverageDurationDetailProvinceAC({ dvt, year, month, day, onBatch }) {
  const connection = await oracledb.getConnection();
  try {
    let groupByFormat = 'YYYY';
    if (day) {
      groupByFormat = 'YYYY-MM-DD';
    } else if (month) {
      groupByFormat = 'YYYY-MM';
    }

    let offset = 0;
    let hasMore = true;
    const groupedData = {};
    const batchSize = 10000

    const sql = `
      SELECT
        IP_ADDRESS,
        SITEID,
        CELLID,
        ALARM_NAME,
        TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY HH24:MI:SS') AS SDATE,
        TO_CHAR(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY HH24:MI:SS') AS EDATE,
        TEAM,
        DEPT AS DVT,
        PROVINCE,
        DISTRICT,
        REGION,
        NETWORK,


        TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), '${groupByFormat}') AS PERIOD,
        
        -- Tổng thời gian mất liên lạc trong ngày SDATE
        (
          GREATEST(
            LEAST(
              NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')),
              TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')
            )
            - TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
            0
          ) * 24 * 60
        ) AS DURATION_IN_DAY,

        -- Thời gian ban ngày: 05:00–22:00 cùng ngày SDATE
        (
          GREATEST(
            LEAST(
              NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')),
              TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 22:00:00', 'DD/MM/YYYY HH24:MI:SS')
            )
            - GREATEST(
                TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 05:00:00', 'DD/MM/YYYY HH24:MI:SS')
              ),
            0
          ) * 24 * 60
        ) AS DURATION_DAYTIME,

        -- Thời gian ban đêm: 00:00–05:00 và 22:00–23:59:59 cùng ngày SDATE
        (
          GREATEST(
            LEAST(
              NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 05:00:00', 'DD/MM/YYYY HH24:MI:SS')),
              TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 05:00:00', 'DD/MM/YYYY HH24:MI:SS')
            )
            - GREATEST(
                TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 00:00:00', 'DD/MM/YYYY HH24:MI:SS')
              ),
            0
          )
          +
          GREATEST(
            LEAST(
              NVL(TO_DATE(EDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                  TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')),
              TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 23:59:59', 'DD/MM/YYYY HH24:MI:SS')
            )
            - GREATEST(
                TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'),
                TO_DATE(TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD/MM/YYYY') || ' 22:00:00', 'DD/MM/YYYY HH24:MI:SS')
              ),
            0
          )
        ) * 24 * 60 AS DURATION_NIGHTTIME

        FROM CANHBAO_MD_MB
        WHERE 1=1
        AND (:dvt IS NULL OR DEPT = :dvt)
        AND (:year IS NULL OR TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'YYYY') = :year)
        AND (:month IS NULL OR TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'MM') = :month)
        AND (:day IS NULL OR TO_CHAR(TO_DATE(SDATE, 'MM/DD/YYYY HH:MI:SS AM'), 'DD') = :day)
      ORDER BY DVT, PERIOD
      OFFSET :offset ROWS FETCH NEXT :batchSize ROWS ONLY
    `;

      while (hasMore) {
        const binds = { dvt, year, month, day, offset, batchSize };

        const result = await connection.execute(sql, binds, {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        });

        const rows = result.rows;

        if (rows.length === 0) {
          hasMore = false;
          break;
        }

        for (const row of rows) {
          const period = row.PERIOD;
          const dvtKey = dvt ? (row.DVT || dvt) : "Trung tâm miền Bắc";
          const TEAM = row.TEAM || 'Không rõ';
          const key = `${TEAM}_${dvtKey}_${period}`;

          const duration = row.DURATION_IN_DAY || 0;
          const duration_daytime = row.DURATION_DAYTIME || 0;
          const duration_nighttime = row.DURATION_NIGHTTIME || 0;

          if (!groupedData[key]) {
            groupedData[key] = {
              dvt: dvtKey,
              TEAM: TEAM,
              period,
              sum_total: 0,
              sum_daytime: 0,
              sum_nighttime: 0,
              count: 0,
            };
          }

          groupedData[key].sum_total += duration;
          groupedData[key].sum_daytime += duration_daytime;
          groupedData[key].sum_nighttime += duration_nighttime;
          groupedData[key].count += 1;
        }


        if (onBatch) {
          const batchSummary = Object.values(groupedData).map(data => {
            const parts = data.period.split('-');
            let formattedPeriod = '';

            if (parts.length === 1) {
              formattedPeriod = `Năm ${parts[0]}`;
            } else if (parts.length === 2) {
              formattedPeriod = `Tháng ${parts[1]} năm ${parts[0]}`;
            } else if (parts.length === 3) {
              formattedPeriod = `Ngày ${parts[2]} tháng ${parts[1]} năm ${parts[0]}`;
            }

            return {
              TEAM: data.TEAM,
              DVT: data.dvt,
              PERIOD: formattedPeriod,
              AVG_DURATION_TOTAL: data.sum_total / data.count,
              AVG_DURATION_DAYTIME: data.sum_daytime / data.count,
              AVG_DURATION_NIGHTTIME: data.sum_nighttime / data.count,
            };
          });

          await onBatch(batchSummary);
        }

        offset += rows.length;
        if (rows.length < batchSize) {
          hasMore = false;
        }
      }

      // Final return
      return Object.values(groupedData).map(data => {
        const parts = data.period.split('-');
        let formattedPeriod = '';

        if (parts.length === 1) {
          formattedPeriod = `Năm ${parts[0]}`;
        } else if (parts.length === 2) {
          formattedPeriod = `Tháng ${parts[1]} năm ${parts[0]}`;
        } else if (parts.length === 3) {
          formattedPeriod = `Ngày ${parts[2]} tháng ${parts[1]} năm ${parts[0]}`;
        }

        return {
          TEAM: data.TEAM,
          DVT: data.dvt,
          PERIOD: formattedPeriod,
          AVG_DURATION_TOTAL: data.sum_total / data.count,
          AVG_DURATION_DAYTIME: data.sum_daytime / data.count,
          AVG_DURATION_NIGHTTIME: data.sum_nighttime / data.count,
        };
      });



  } finally {
    await connection.close();
  }
}



module.exports = { getAllStats, getAverageDurationAC,getAverageDurationDetailAC, getSlicerOptionsAC, getAverageDurationDetailProvinceAC};
