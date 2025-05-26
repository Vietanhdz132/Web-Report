
const TramMLLTINH = require('../../models/tramMLL/tramMLLTINH');


class TramMLLTINHController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await TramMLLTINH.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho MLLTINH
      const pageMLLTINH = parseInt(req.query.pageMLLTINH) || 1;
      const pageSizeMLLTINH = parseInt(req.query.pageSizeMLLTINH) || 50;

      const dataMLLTINH = await TramMLLTINH.getAllStats(pageMLLTINH, pageSizeMLLTINH);

      res.render('testdata/trammllTINH', {
        layout: 'testdataLayout', 
        titleMLLTINH: 'Danh sách trạm MLL theo Tỉnh',
        dataMLLTINH,
        pageMLLTINH,
        pageSizeMLLTINH,
        hasPrevMLLTINH: pageMLLTINH > 1,
        hasNextMLLTINH: dataMLLTINH.length === pageSizeMLLTINH,
        prevPageMLLTINH: pageMLLTINH - 1,
        nextPageMLLTINH: pageMLLTINH + 1,
      });
    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new TramMLLTINHController();
