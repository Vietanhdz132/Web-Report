const TramMLL = require('../../models/tramMLL/tramMLL');




class TramMLLController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await TramMLLDVT.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho MLL
      const pageMLL = parseInt(req.query.pageMLL) || 1;
      const pageSizeMLL = parseInt(req.query.pageSizeMLL) || 50;

      const dataMLL = await TramMLL.getAllStats(pageMLL, pageSizeMLL);
 

      res.render('testdata/trammll', {
        layout: 'testdataLayout',      // <-- chỉ định layout testdata.hbs
        titleMLL: 'Danh sách trạm MLL',
        dataMLL,
        pageMLL,
        pageSizeMLL,
        hasPrevMLL: pageMLL > 1,
        hasNextMLL: dataMLL.length === pageSizeMLL,
        prevPageMLL: pageMLL - 1,
        nextPageMLL: pageMLL + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new TramMLLController();
