const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require("cookie-parser");
const axios = require('axios');
const cron = require('node-cron');
const { writeLog } = require('./ulti/logger');
const moment = require('moment');
const os = require('os');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const userModel = require('./app/models/userModel');

const app = express();
const port = 3000;

const route = require('./routes');
const db = require('./config/db/oracleClient');
const mongoDB = require('./config/db/mongoClient');

async function startServer() {
  try {
    // Kết nối DB
    db.connect();  
    await mongoDB.connect(); 
    await userModel.initDefaultAdmin();  // Tạo admin mặc định nếu chưa có

    // Middleware & cài đặt ứng dụng
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride('_method'));

    // app.use((req, res, next) => {
    //   console.log('🛰️ Request:', req.method, req.url);
    //   next();
    // });
    //HTTP logger
    //app.use(morgan('combined'))

    //template engine
    app.engine(
      'hbs',
      engine({
        extname: '.hbs',
        partialsDir: path.join(__dirname, 'resources', 'views', 'partials'),
        helpers: {
          eq: (a, b) => a === b,
          splitLines: (text) => {
            if (!text) return [];
            return text.split('\n').map(line => line.replace(/^-/, '').trim());
          },
          formatDate: (date) => {
            if (!date) return '';
            return moment(date).format('DD/MM/YYYY');
          }
        }
      }),
    );
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'resources', 'views'));

    // Routes
    route(app);

    // Start server
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });

    // Cron job chạy vào 7h sáng hàng ngày
    let isRunning = false;
    cron.schedule('0 7 * * *', async () => {
      if (isRunning) {
        writeLog('⚠️ Bỏ qua: job 7h đang chạy');
        return;
      }
      isRunning = true;
      const start = Date.now();
      writeLog('⏳ [7h Cron] Bắt đầu chạy đồng bộ dữ liệu...');
      try {
        console.log('▶️ [7h VN] Đang gọi API /data/syncAll...');
        const res = await axios.get('http://localhost:3000/data/syncAll', { timeout: 60_000 });
        const message = res.data?.message || res.data;
        writeLog(`✅ Đồng bộ thành công: ${JSON.stringify(message)}`);
        console.log('✅ Đồng bộ hoàn tất:', message);
      } catch (error) {
        writeLog(`❌ Lỗi khi đồng bộ: ${error.message}\n`);
        console.error('❌ Lỗi khi gọi API syncAll:', error.message);
      } finally {
        const duration = ((Date.now() - start) / 1000).toFixed(2);
        writeLog(`⏱️ Job 7h chạy trong ${duration}s`);
        // Log trạng thái hệ thống
        const cpuLoad = os.loadavg().map(n => n.toFixed(2)).join(', ');
        const freeMemMB = (os.freemem() / 1e6).toFixed(1);
        writeLog(`🔍 CPU Load (1m, 5m, 15m): ${cpuLoad} | Free Mem: ${freeMemMB} MB\n`);
        isRunning = false;
      }
    }, {
      timezone: 'Asia/Ho_Chi_Minh'
    });

    require('./helpers/handlebars');

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);  
  }
}

startServer();
