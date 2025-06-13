const ftpClient = require('../../../config/db/ftpClient');
const oracleClient = require('../../../config/db/oracleClient');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const BATCH_SIZE = 10000;

/**
 * Đồng bộ 1 file CSV từ FTP vào Oracle DB
 * @param {string} remotePath - Đường dẫn file trên FTP
 * @param {string} localPath - Đường dẫn file local sau tải về
 * @param {string} tableName - Tên bảng Oracle
 * @param {string[]} columns - Danh sách cột
 * @param {function} bindsFn - Hàm nhận row, trả về mảng params dùng cho executeMany batch
 * @param {function} mapRowFn - Hàm xử lý batch cuối cùng (thường giống bindsFn)
 */
async function syncData(remotePath, localPath, tableName, columns, mapRowFn) {
  const localDir = path.dirname(localPath);
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  await ftpClient.connect();
  await ftpClient.downloadFile(remotePath, localPath);
  console.log(`✅ File downloaded to ${localPath}`);

  const connection = await oracleClient.getConnection();
  const fileStream = fs.createReadStream(localPath);
  const parser = csvParser();
  const rowsBatch = [];

  return new Promise((resolve, reject) => {
    fileStream
      .pipe(parser)
      .on('data', async (row) => {
        parser.pause();
        rowsBatch.push(row);

        if (rowsBatch.length >= BATCH_SIZE) {
          try {
            const binds = rowsBatch.map(mapRowFn);
            await connection.executeMany(
              `INSERT INTO ${tableName} (
                ${columns.join(', ')}
              ) VALUES (
                TO_DATE(:1, 'DD/MM/YYYY'), ${columns.slice(1).map((_, i) => `:${i + 2}`).join(', ')}
              )`,
              binds,
              { autoCommit: false }
            );
            console.log(`✅ Batch inserted: ${rowsBatch.length} rows`);
            rowsBatch.length = 0;
            parser.resume();
          } catch (err) {
            fileStream.destroy(err);
            reject(err);
          }
        } else {
          parser.resume();
        }
      })
      .on('end', async () => {
        try {
          if (rowsBatch.length > 0) {
            const binds = rowsBatch.map(mapRowFn);
            await connection.executeMany(
              `INSERT INTO ${tableName} (
                ${columns.join(', ')}
              ) VALUES (
                TO_DATE(:1, 'DD/MM/YYYY'), ${columns.slice(1).map((_, i) => `:${i + 2}`).join(', ')}
              )`,
              binds,
              { autoCommit: false }
            );
            console.log(`✅ Final batch inserted: ${rowsBatch.length} rows`);
          }

          await connection.commit();
          await connection.close();
          await ftpClient.close();

          console.log('✅ Sync completed');
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', err => reject(err));
  });
}

async function downloadAndUnzipFromFTP(remoteZipPath, localZipPath) {
  const localDir = path.dirname(localZipPath);
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  // Kết nối và tải file .zip
  await ftpClient.connect();
  await ftpClient.downloadFile(remoteZipPath, localZipPath);
  console.log(`✅ File .zip downloaded to ${localZipPath}`);
  await ftpClient.close();
  
  // BGiải nén
  const extractedFiles = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(localZipPath)
      .pipe(unzipper.Parse())
      .on('entry', function (entry) {
        const fileName = entry.path;
        const destPath = path.join(localDir, fileName);

        if (fileName.endsWith('.csv')) {
          extractedFiles.push(destPath);
          entry.pipe(fs.createWriteStream(destPath));
        } else {
          entry.autodrain();
        }
      })
      .on('error', reject)
      .on('close', resolve);
  });

  // Xoá file zip sau khi giải nén
  try {
    fs.unlinkSync(localZipPath);
    console.log(`🗑️ Deleted ZIP file: ${localZipPath}`);
  } catch (err) {
    console.warn(`⚠️ Could not delete ZIP file: ${err.message}`);
  }

  // Kiểm tra kết quả
  if (extractedFiles.length === 0) {
    throw new Error('❌ No CSV file found inside the ZIP');
  }

  console.log(`✅ Extracted CSV: ${extractedFiles[0]}`);
  return extractedFiles[0];
}

async function importData(localPath, tableName, columns, mapRowFn) {
  const localDir = path.dirname(localPath);
  
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  const connection = await oracleClient.getConnection();
  const fileStream = fs.createReadStream(localPath);
  const parser = csvParser({
  mapHeaders: ({ header }) => {
    const cleaned = header.trim().replace(/^"+|"+$/g, ''); // xóa tất cả dấu " đầu cuối và trim
    console.log(`Header raw: [${header}] => cleaned: [${cleaned}]`);
    return cleaned;
  }
});

  const placeholders = columns.map((_, i) => `:${i + 1}`).join(', ');
  const rowsBatch = [];

  return new Promise((resolve, reject) => {
    fileStream
      .pipe(parser)
      .on('data', async (row) => {
        parser.pause();
        rowsBatch.push(row);

        if (rowsBatch.length >= BATCH_SIZE) {
          try {
            const binds = rowsBatch.map(mapRowFn);
            await connection.executeMany(
              `INSERT INTO ${tableName} (
                ${columns.join(', ')}
              ) VALUES (${placeholders})`,
              binds,
              { autoCommit: false }
            );
            console.log(`✅ Batch inserted: ${rowsBatch.length} rows`);
            rowsBatch.length = 0;
            parser.resume();
          } catch (err) {
            fileStream.destroy(err);
            reject(err);
          }
        } else {
          parser.resume();
        }
      })
      .on('end', async () => {
        try {
          if (rowsBatch.length > 0) {
            const binds = rowsBatch.map(mapRowFn);
            await connection.executeMany(
              `INSERT INTO ${tableName} (
                ${columns.join(', ')}
              ) VALUES (${placeholders})`,
              binds,
              { autoCommit: false }
            );
            console.log(`✅ Final batch inserted: ${rowsBatch.length} rows`);
          }

          await connection.commit();
          await connection.close();

          console.log('✅ Sync completed');
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', err => reject(err));
  });
}

module.exports = { syncData, importData, downloadAndUnzipFromFTP };
