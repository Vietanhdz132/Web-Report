const fs = require('fs');
const path = require('path');

const logDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

function writeLog(message) {
  const now = new Date();
  const timestamp = now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const logLine = `[${timestamp}] ${message}\n`;

  const logPath = path.join(logDir, 'sync.log');
  fs.appendFile(logPath, logLine, (err) => {
    if (err) console.error('❌ Ghi log thất bại:', err);
  });
}

module.exports = { writeLog };
