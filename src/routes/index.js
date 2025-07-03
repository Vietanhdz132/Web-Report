const contactRouter = require('./contact');
const siteRouter = require('./site');
const authRouter = require('./auth');
const tokenRouter = require('./token');
const AuthMiddleWare = require('../middleware/AuthMiddleware');  // Import AuthMiddleware
const testdataRouter = require('./testdata/testdata');
const dashbroadRouter = require('./dashbroad/dashboard');
const syncRoute = require('./sync.route');
const phongVTNRouter = require('./report/phongVTN.router');


function route(app) {
  // Đăng ký route bảo vệ

  // Bảo vệ route order

  // Các route không yêu cầu xác thực
  app.use('/report', phongVTNRouter);
  app.use('/data', syncRoute);
  app.use('/dashboard', dashbroadRouter);
  app.use('/testdata', testdataRouter);
  app.use('/contact', contactRouter);
  app.use('/auth', authRouter);
  app.use('/', siteRouter);

}

module.exports = route;
