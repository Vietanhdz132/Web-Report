const express = require('express');
const path = require('path');
const { format } = require('date-fns');
const { syncData } = require('../services/syncService');

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

module.exports = router;
