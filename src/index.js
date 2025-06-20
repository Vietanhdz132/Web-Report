const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require("cookie-parser");
const axios = require('axios');
const cron = require('node-cron');
const { writeLog } = require('./ulti/logger')
const { engine } = require('express-handlebars');
const app = express();
const port = 3000;

const route = require('./routes');
const db = require('./config/db/oracleClient');

// Connect to DB
db.connect();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.urlencoded());
app.use(express.json());

//HTTP logger
//app.use(morgan('combined'))

//template engine
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
  }),
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

//Routes init
route(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);

  let isRunning = false;

  cron.schedule('0 7 * * *', async () => {
    if (isRunning) {
      writeLog('⚠️ Bỏ qua: job 7h đang chạy');
      return;
    }

    isRunning = true;
    writeLog('⏳ [7h Cron] Bắt đầu chạy đồng bộ dữ liệu...');

    try {
      console.log('▶️ [7h VN] Đang gọi API /data/syncAll...');
      const res = await axios.get('http://localhost:3000/data/syncAll');

      const message = res.data?.message || res.data;
      writeLog(`✅ Đồng bộ thành công: ${JSON.stringify(message)}\n`);
      console.log('✅ Đồng bộ hoàn tất:', message);

    } catch (error) {
      writeLog(`❌ Lỗi khi đồng bộ: ${error.message}\n`);
      console.error('❌ Lỗi khi gọi API syncAll:', error.message);
    } finally {
      isRunning = false;
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });
});