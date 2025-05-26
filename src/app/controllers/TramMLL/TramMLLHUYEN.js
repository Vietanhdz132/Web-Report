
const TramMLLHUYEN = require('../../models/tramMLL/tramMLLHUYEN');


class TramMLLHUYENController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await TramMLLHUYEN.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho MLLHUYEN
      const pageMLLHUYEN = parseInt(req.query.pageMLLHUYEN) || 1;
      const pageSizeMLLHUYEN = parseInt(req.query.pageSizeMLLHUYEN) || 50;

      const dataMLLHUYEN = await TramMLLHUYEN.getAllStats(pageMLLHUYEN, pageSizeMLLHUYEN);

      res.render('testdata/trammllHUYEN', {
        layout: 'testdataLayout', 
        titleMLLHUYEN: 'Danh sách trạm MLL theo Huyện',
        dataMLLHUYEN,
        pageMLLHUYEN,
        pageSizeMLLHUYEN,
        hasPrevMLLHUYEN: pageMLLHUYEN > 1,
        hasNextMLLHUYEN: dataMLLHUYEN.length === pageSizeMLLHUYEN,
        prevPageMLLHUYEN: pageMLLHUYEN - 1,
        nextPageMLLHUYEN: pageMLLHUYEN + 1,
      });
    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new TramMLLHUYENController();
