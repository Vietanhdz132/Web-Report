const contactRouter = require('./contact');
const itemsRouter = require('./items');
const siteRouter = require('./site');
const authRouter = require('./auth');
const productRouter = require('./products');
const orderRouter = require('./order');
const tokenRouter = require('./token');
const AuthMiddleWare = require('../middleware/AuthMiddleware');  // Import AuthMiddleware
const testdataRouter = require('./testdata/testdata');

function route(app) {
  // Đăng ký route bảo vệ

  // Bảo vệ route order

  // Các route không yêu cầu xác thực
  app.use('/testdata', testdataRouter);
  app.use('/order', AuthMiddleWare.isAuth, orderRouter);
  app.use('/products', productRouter);
  app.use('/contact', contactRouter);
  app.use('/items', itemsRouter);
  app.use('/auth', authRouter);
  app.use('/', siteRouter);

}

module.exports = route;
