const express = require('express');
const path = require('path');
const { format } = require('date-fns');
const { syncData,importData } = require('../services/syncService');

const router = express.Router();

router.get('/sync', async (req, res) => {
  try {
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyyMMdd');
    const fileName = `Traffic2G_Cell_${yesterday}.csv`;

    const remotePath = `/Traffic2G_Cell/${fileName}`;
    const localPath = path.resolve(__dirname, '../data', fileName);

    const tableName = 'TRAFFIC2G_CELL';
    const columns = [
      'REPORT_DATE', 'BSCNAME', 'SITENAME', 'CELLNAME',
      'TRAFFIC_2G', 'HTRAFFIC_2G',
      'EDL_TRAF', 'EUL_TRAF', 'GDL_TRAF', 'GUL_TRAF', 'DATA_2G'
    ];


    // mapRowFn cho batch cuối có thể giống bindsFn hoặc khác nếu cần
    const mapRowFn = (row) => [
      row.DATE,
      row.BSCNAME,
      row.SITENAME,
      row.CELLNAME,
      parseFloat(row.TRAFFIC_2G || 0),
      parseFloat(row.HTRAFFIC_2G || 0),
      parseFloat(row.EDL_TRAF || 0),
      parseFloat(row.EUL_TRAF || 0),
      parseFloat(row.GDL_TRAF || 0),
      parseFloat(row.GUL_TRAF || 0),
      parseFloat(row.DATA_2G || 0),
    ];

    await syncData(remotePath, localPath, tableName, columns, mapRowFn);

    res.status(200).json({ message: '✅ Sync completed successfully' });
  } catch (err) {
    console.error('❌ Sync failed:', err);
    res.status(500).json({ message: '❌ Sync failed', error: err.message });
  }
});

router.get('/syncMLL', async (req, res) => {
  try {
    
    const fileName = `MLL_MB_202506010.csv`;

 
    const localPath = path.resolve(__dirname, '../data', fileName);
    const tableName = 'MLL_MB';
    const columns = [
  'ID', 'TICKET_ID', 'SITE_ID', 'ALARM_NAME', 'SDATE', 'EDATE', 'PROVINCE', 'DISTRICT', 'REGION',
  'MA_TRUNG_TAM_XL', 'MA_PHONG_XL', 'MA_TO_XL', 'NETWORK', 'NN_CAP_1', 'NN_CAP_2', 'NN_CAP_3',
  'NGAY_TAO', 'HE_THONG', 'CLEARED', 'MD_SDATE', 'IS_REDUCE'
];



    // mapRowFn cho batch cuối có thể giống bindsFn hoặc khác nếu cần
    const mapRowFn = (row) => [
        row.ID,
        row.TICKET_ID,
        row.SITE_ID,
        row.ALARM_NAME,
        row.SDATE,
        row.EDATE,
        row.PROVINCE,
        row.DISTRICT,
        row.REGION,
        row.MA_TRUNG_TAM_XL,
        row.MA_PHONG_XL,
        row.MA_TO_XL,
        row.NETWORK,
        row.NN_CAP_1,
        row.NN_CAP_2,
        row.NN_CAP_3,
        row.NGAY_TAO,
        row.HE_THONG,
        row.CLEARED,
        row.MD_SDATE,
        row.IS_REDUCE,
    ];

    await importData(localPath, tableName, columns, mapRowFn);

    res.status(200).json({ message: '✅ Sync completed successfully' });
  } catch (err) {
    console.error('❌ Sync failed:', err);
    res.status(500).json({ message: '❌ Sync failed', error: err.message });
  }
});

module.exports = router;
