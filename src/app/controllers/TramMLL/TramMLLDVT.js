
const TramMLLDVT = require('../../models/tramMLLDVT');


class TramMLLDVTController {
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
      // Phân trang riêng cho MLLDVT
      const pageMLLDVT = parseInt(req.query.pageMLLDVT) || 1;
      const pageSizeMLLDVT = parseInt(req.query.pageSizeMLLDVT) || 50;

      const dataMLLDVT = await TramMLLDVT.getAllStats(pageMLLDVT, pageSizeMLLDVT);

      res.render('testdata/trammlldvt', {
        layout: 'testdataLayout', 
        titleMLLDVT: 'Danh sách trạm MLL theo ĐVT',
        dataMLLDVT,
        pageMLLDVT,
        pageSizeMLLDVT,
        hasPrevMLLDVT: pageMLLDVT > 1,
        hasNextMLLDVT: dataMLLDVT.length === pageSizeMLLDVT,
        prevPageMLLDVT: pageMLLDVT - 1,
        nextPageMLLDVT: pageMLLDVT + 1,
      });
    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new TramMLLDVTController();
