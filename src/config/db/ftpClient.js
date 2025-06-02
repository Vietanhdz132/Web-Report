const FTP = require('basic-ftp');
const { PassThrough } = require('stream');

const client = new FTP.Client();
client.ftp.verbose = false;

const config = {
  host: '10.51.44.231',
  user: 'mlmb_ftp',
  password: 'wgAW6PBGwwK2',
  port: 21,
  secure: false,
};

let connected = false;

async function connect() {
  if (connected) return;
  try {
    await client.access(config);
    connected = true;
    console.log('✅ FTP connected');
  } catch (err) {
    client.close();
    connected = false;
    console.error('❌ FTP connect error:', err);
    throw err;
  }
}

async function list(path = '/') {
  if (!connected) await connect();
  return await client.list(path);
}

async function downloadFile(remotePath, localPath) {
  if (!connected) await connect();
  return await client.downloadTo(localPath, remotePath);
}

// ✅ Hàm mới: tải file từ FTP trực tiếp thành stream
async function downloadStream(remotePath, outputStream) {
  if (!connected) await connect();
  try {
    await client.downloadTo(outputStream, remotePath);
    console.log(`📥 Streamed file from FTP: ${remotePath}`);
  } catch (err) {
    console.error('❌ FTP stream error:', err);
    throw err;
  }
}

async function close() {
  if (connected) {
    client.close();
    connected = false;
    console.log('🔒 FTP connection closed');
  }
}

module.exports = {
  connect,
  list,
  downloadFile,
  downloadStream, // ⬅️ export hàm stream
  close,
};
