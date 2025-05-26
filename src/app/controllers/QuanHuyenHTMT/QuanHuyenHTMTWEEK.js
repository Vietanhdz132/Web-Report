const QuanHuyenHTMTWEEK = require('../../models/quanhuyenHTMT/quanhuyenHTMTWEEK');




class QuanHuyenHTMTWEEKController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await QuanHuyenHTMTWEEK.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho QuanHuyenHTMTWEEK
      const pageQuanHuyenHTMTWEEK = parseInt(req.query.pageQuanHuyenHTMTWEEK) || 1;
      const pageSizeQuanHuyenHTMTWEEK = parseInt(req.query.pageSizeQuanHuyenHTMTWEEK) || 50;

      const dataQuanHuyenHTMTWEEK = await QuanHuyenHTMTWEEK.getAllStats(pageQuanHuyenHTMTWEEK, pageSizeQuanHuyenHTMTWEEK);
 

      res.render('quanhuyenHTMT/quanhuyenHTMTweek', {
        layout: 'testdataLayout',      // <-- chỉ định layout testdata.hbs
        titleQuanHuyenHTMTWEEK: 'Danh sách quận huyện HTMT theo tuần',
        dataQuanHuyenHTMTWEEK,
        pageQuanHuyenHTMTWEEK,
        pageSizeQuanHuyenHTMTWEEK,
        hasPrevQuanHuyenHTMTWEEK: pageQuanHuyenHTMTWEEK > 1,
        hasNextQuanHuyenHTMTWEEK: dataQuanHuyenHTMTWEEK.length === pageSizeQuanHuyenHTMTWEEK,
        prevPageQuanHuyenHTMTWEEK: pageQuanHuyenHTMTWEEK - 1,
        nextPageQuanHuyenHTMTWEEK: pageQuanHuyenHTMTWEEK + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new QuanHuyenHTMTWEEKController();
