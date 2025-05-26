
const TramMLLTVT = require('../../models/tramMLL/tramMLLTVT');


class TramMLLTVTController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await TramMLLTVT.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho MLLTVT
      const pageMLLTVT = parseInt(req.query.pageMLLTVT) || 1;
      const pageSizeMLLTVT = parseInt(req.query.pageSizeMLLTVT) || 50;

      const dataMLLTVT = await TramMLLTVT.getAllStats(pageMLLTVT, pageSizeMLLTVT);

      res.render('testdata/trammllTVT', {
        layout: 'testdataLayout', 
        titleMLLTVT: 'Danh sách trạm MLL theo TVT',
        dataMLLTVT,
        pageMLLTVT,
        pageSizeMLLTVT,
        hasPrevMLLTVT: pageMLLTVT > 1,
        hasNextMLLTVT: dataMLLTVT.length === pageSizeMLLTVT,
        prevPageMLLTVT: pageMLLTVT - 1,
        nextPageMLLTVT: pageMLLTVT + 1,
      });
    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new TramMLLTVTController();
