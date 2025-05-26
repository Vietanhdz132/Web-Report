const QuanHuyenHTMTDAY = require('../../models/quanhuyenHTMT/quanhuyenHTMTDAY');




class QuanHuyenHTMTDAYController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await QuanHuyenHTMTDAY.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho QuanHuyenHTMTDAY
      const pageQuanHuyenHTMTDAY = parseInt(req.query.pageQuanHuyenHTMTDAY) || 1;
      const pageSizeQuanHuyenHTMTDAY = parseInt(req.query.pageSizeQuanHuyenHTMTDAY) || 50;

      const dataQuanHuyenHTMTDAY = await QuanHuyenHTMTDAY.getAllStats(pageQuanHuyenHTMTDAY, pageSizeQuanHuyenHTMTDAY);
 

      res.render('quanhuyenHTMT/quanhuyenHTMTday', {
        layout: 'testdataLayout',      // <-- chỉ định layout testdata.hbs
        titleQuanHuyenHTMTDAY: 'Danh sách quận huyện HTMT theo ngày',
        dataQuanHuyenHTMTDAY,
        pageQuanHuyenHTMTDAY,
        pageSizeQuanHuyenHTMTDAY,
        hasPrevQuanHuyenHTMTDAY: pageQuanHuyenHTMTDAY > 1,
        hasNextQuanHuyenHTMTDAY: dataQuanHuyenHTMTDAY.length === pageSizeQuanHuyenHTMTDAY,
        prevPageQuanHuyenHTMTDAY: pageQuanHuyenHTMTDAY - 1,
        nextPageQuanHuyenHTMTDAY: pageQuanHuyenHTMTDAY + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new QuanHuyenHTMTDAYController();
