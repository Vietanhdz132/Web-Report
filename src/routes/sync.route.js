const express = require('express');
const path = require('path');
const fs = require('fs');  
const fsPromises = require('fs').promises;
const { format } = require('date-fns');
const { syncData,importData,downloadAndUnzipFromFTP } = require('../app/models/services/syncService');

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

router.get('/test-download', async (req, res) => {
  // Nhận remotePath từ query hoặc dùng mặc định nếu không có
  const remotePath = req.query.remotePath || '/ALARM/MLL_MB_20250601.zip';

  // Lấy tên file zip từ remotePath
  const fileName = path.basename(remotePath);

  // Tạo đường dẫn lưu file zip ở thư mục /data
  const localPath = path.resolve(__dirname, '../data', fileName);

  try {
    const extractedCsvPath = await downloadAndUnzipFromFTP(remotePath, localPath);
    res.json({
      message: '✅ File downloaded and extracted successfully',
      csvPath: extractedCsvPath
    });
  } catch (error) {
    console.error('❌ Download failed:', error);
    res.status(500).json({ error: error.message });
  }
});



router.get('/syncMLL', async (req, res) => {
  try {
    const fileName = `MLL_MB_20250612.csv`; // hoặc tính tự động theo ngày như đã gợi ý
    const localPath = path.resolve(__dirname, '../data', fileName);

    if (!fs.existsSync(localPath)) {
      return res.status(400).json({ message: `❌ File not found: ${fileName}` });
    }

    const tableName = 'MLL_MB';
    const columns = [
      'ID', 'TICKET_ID', 'SITE_ID', 'ALARM_NAME', 'SDATE', 'EDATE', 'PROVINCE', 'DISTRICT', 'REGION',
      'MA_TRUNG_TAM_XL', 'MA_PHONG_XL', 'MA_TO_XL', 'NETWORK', 'NN_CAP_1', 'NN_CAP_2', 'NN_CAP_3',
      'NGAY_TAO', 'HE_THONG', 'CLEARED', 'MD_SDATE', 'IS_REDUCE'
    ];

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

    try {
      await fsPromises.unlink(localPath);
      console.log('✅ File deleted successfully');
    } catch (delErr) {
      console.error('❌ Failed to delete file:', delErr);
    }

    res.status(200).json({
      message: '✅ Sync completed successfully MLL_MB',
      file: fileName,
      table: tableName,
      totalColumns: columns.length
    });
  } catch (err) {
    console.error('❌ Sync failed:', err);
    res.status(500).json({ message: '❌ Sync failed', error: err.message });
  }
});

router.get('/syncMFD', async (req, res) => {
  try {
    const fileName = `MFD_MB_20250613.csv`; // hoặc tính tự động theo ngày như đã gợi ý
    const localPath = path.resolve(__dirname, '../data', fileName);

    if (!fs.existsSync(localPath)) {
      return res.status(400).json({ message: `❌ File not found: ${fileName}` });
    }

    const tableName = 'MFD_MB';
    const columns = [
      'IP_ADDRESS', 'SITEID', 'CELLID', 'ALARM_NAME', 'SDATE', 'EDATE', 'UCTT', 'NE_TYPE', 'ALARM_TYPE',
      'DISTRICT', 'PROVINCE', 'TEAM', 'DEPT', 'REGION', 'NETWORK', 'UK_ALARM_KEY',
      'VENDOR', 'NE', 'DATETIME', 'CREATED_DATE', 'CLEARED'
    ];

    const mapRowFn = (row) => [
      row.IP_ADDRESS,
      row.SITEID,
      row.CELLID,
      row.ALARM_NAME,
      row.SDATE,
      row.EDATE,
      row.UCTT,
      row.NE_TYPE,
      row.ALARM_TYPE,
      row.DISTRICT,
      row.PROVINCE,
      row.TEAM,
      row.DEPT,
      row.REGION,
      row.NETWORK,
      row.UK_ALARM_KEY,
      row.VENDOR,
      row.NE,
      row.DATETIME,
      row.CREATED_DATE,
      row.CLEARED,
    ];

    await importData(localPath, tableName, columns, mapRowFn);

    try {
      await fsPromises.unlink(localPath);
      console.log('✅ File deleted successfully');
    } catch (delErr) {
      console.error('❌ Failed to delete file:', delErr);
    }

    res.status(200).json({
      message: '✅ Sync completed successfully MFD_MB',
      file: fileName,
      table: tableName,
      totalColumns: columns.length
    });
  } catch (err) {
    console.error('❌ Sync failed:', err);
    res.status(500).json({ message: '❌ Sync failed', error: err.message });
  }
});

router.get('/syncMD', async (req, res) => {
  try {
    const fileName = `CanhbaoMD_MB_20250613.csv`; // hoặc tính tự động theo ngày như đã gợi ý
    const localPath = path.resolve(__dirname, '../data', fileName);

    if (!fs.existsSync(localPath)) {
      return res.status(400).json({ message: `❌ File not found: ${fileName}` });
    }

    const tableName = 'CanhbaoMD_MB';
    const columns = [
      'IP_ADDRESS', 'SITEID', 'CELLID', 'ALARM_NAME', 'SDATE', 'EDATE', 'UCTT', 'NE_TYPE', 'ALARM_TYPE',
      'DISTRICT', 'PROVINCE', 'TEAM', 'DEPT', 'REGION', 'NETWORK', 'UK_ALARM_KEY',
      'VENDOR', 'NE', 'DATETIME', 'CREATED_DATE', 'CLEARED'
    ];

    const mapRowFn = (row) => [
      row.IP_ADDRESS,
      row.SITEID,
      row.CELLID,
      row.ALARM_NAME,
      row.SDATE,
      row.EDATE,
      row.UCTT,
      row.NE_TYPE,
      row.ALARM_TYPE,
      row.DISTRICT,
      row.PROVINCE,
      row.TEAM,
      row.DEPT,
      row.REGION,
      row.NETWORK,
      row.UK_ALARM_KEY,
      row.VENDOR,
      row.NE,
      row.DATETIME,
      row.CREATED_DATE,
      row.CLEARED,
    ];

    await importData(localPath, tableName, columns, mapRowFn);

    try {
      await fsPromises.unlink(localPath);
      console.log('✅ File deleted successfully');
    } catch (delErr) {
      console.error('❌ Failed to delete file:', delErr);
    }

    res.status(200).json({
      message: '✅ Sync completed successfully CanhbaoMD_MB',
      file: fileName,
      table: tableName,
      totalColumns: columns.length
    });
  } catch (err) {
    console.error('❌ Sync failed:', err);
    res.status(500).json({ message: '❌ Sync failed', error: err.message });
  }
});


router.get('/syncPAKH', async (req, res) => {
  try {
    const fileName = `PAKH_MB_20250612.csv`; // hoặc tính tự động theo ngày như đã gợi ý
    const localPath = path.resolve(__dirname, '../data', fileName);

    if (!fs.existsSync(localPath)) {
      return res.status(400).json({ message: `❌ File not found: ${fileName}` });
    }

    const tableName = 'PAKH_MB';
    const columns = [
      'ID',
      'SO_THUE_BAO',
      'LOAI_THUE_BAO',
      'NOI_DUNG_PHAN_ANH',
      'TINH_THANH_PHO',
      'QUAN_HUYEN',
      'PHUONG_XA',
      'NHOM_PHAN_ANH',
      'LOAI_PHAN_ANH',
      'HIEN_TUONG',
      'THONG_TIN_XU_LY',
      'THOI_GIAN_GHI_NHAN',
      'THOI_GIAN_CON_LAI',
      'TONG_THOI_GIAN_XU_LY',
      'TRUNG_TAM',
      'DON_VI',
      'LIEN_HE_VOI_KHACH_HANG',
      'TRANG_THAI_WO',
      'MUC_CANH_BAO',
      'NOC_STATUS',
      'IS_TICKET',
      'DON_VI_NHAN',
      'MA_TINH',
      'MA_HUYEN',
      'MA_XA',
      'MA_LOAI_PA',
      'MA_HIEN_TUONG',
      'TG_TAO_WO',
      'NGUYEN_NHAN',
      'TEN_NGUYEN_NHAN',
      'MA_TRAM',
      'DVI_TAO_TICKET',
      'ACTUA_DATE',
      'DELINE_DATE',
      'NGUOI_XU_LY',
      'CEN_CODE',
      'CA_TRUC',
      'DV_NHAN_NOTIFICATION',
      'FO_BO',
      'CHI_TIET_NN',
      'TEN_CHI_TIET_NN',
      'MA_NHOM_PA',
      'PAKH_LIEN_QUAN',
      'TG_KETTHUC',
      'TGCL_TTML',
      'LAT',
      'LNG',
      'IS_SEND_ALARM',
      'KET_QUA_XL',
      'TT_DIEU_PHOI',
      'PHONG_DIEU_PHOI',
      'TO_DIEU_PHOI',
      'TG_DONG_CL',
      'NETWORK_TYPE',
      'ID_CHA',
      'LOAI_GOP',
      'R_INDEX',
      'MA_CV',
      'IS_TAC_DONG',
      'MA_TICKET_RAN',
      'FB_USER',
      'PAKH_COUNT',
      'TRANG_THAI'  
    ];

    const mapRowFn = (row) => [
      row.ID,
      row.SO_THUE_BAO,
      row.LOAI_THUE_BAO,
      row.NOI_DUNG_PHAN_ANH,
      row.TINH_THANH_PHO,
      row.QUAN_HUYEN,
      row.PHUONG_XA,
      row.NHOM_PHAN_ANH,
      row.LOAI_PHAN_ANH,
      row.HIEN_TUONG,
      row.THONG_TIN_XU_LY,
      row.THOI_GIAN_GHI_NHAN,
      row.THOI_GIAN_CON_LAI,
      row.TONG_THOI_GIAN_XU_LY,
      row.TRUNG_TAM,
      row.DON_VI,
      row.LIEN_HE_VOI_KHACH_HANG,
      row.TRANG_THAI_WO,
      row.MUC_CANH_BAO,
      row.NOC_STATUS,
      row.IS_TICKET,
      row.DON_VI_NHAN,
      row.MA_TINH,
      row.MA_HUYEN,
      row.MA_XA,
      row.MA_LOAI_PA,
      row.MA_HIEN_TUONG,
      row.TG_TAO_WO,
      row.NGUYEN_NHAN,
      row.TEN_NGUYEN_NHAN,
      row.MA_TRAM,
      row.DVI_TAO_TICKET,
      row.ACTUA_DATE,
      row.DELINE_DATE,
      row.NGUOI_XU_LY,
      row.CEN_CODE,
      row.CA_TRUC,
      row.DV_NHAN_NOTIFICATION,
      row.FO_BO,
      row.CHI_TIET_NN,
      row.TEN_CHI_TIET_NN,
      row.MA_NHOM_PA,
      row.PAKH_LIEN_QUAN,
      row.TG_KETTHUC,
      row.TGCL_TTML,
      row.LAT,
      row.LNG,
      row.IS_SEND_ALARM,
      row.KET_QUA_XL,
      row.TT_DIEU_PHOI,
      row.PHONG_DIEU_PHOI,
      row.TO_DIEU_PHOI,
      row.TG_DONG_CL,
      row.NETWORK_TYPE,
      row.ID_CHA,
      row.LOAI_GOP,
      row.R_INDEX,
      row.MA_CV,
      row.IS_TAC_DONG,
      row.MA_TICKET_RAN,
      row.FB_USER,
      row.PAKH_COUNT,
      row.TRANG_THAI
    ];

    await importData(localPath, tableName, columns, mapRowFn);

    try {
      await fsPromises.unlink(localPath);
      console.log('✅ File deleted successfully');
    } catch (delErr) {
      console.error('❌ Failed to delete file:', delErr);
    }

    res.status(200).json({
      message: '✅ Sync completed successfully PAKH_MB',
      file: fileName,
      table: tableName,
      totalColumns: columns.length
    });
  } catch (err) {
    console.error('❌ Sync failed:', err);
    res.status(500).json({ message: '❌ Sync failed', error: err.message });
  }
});

module.exports = router;
