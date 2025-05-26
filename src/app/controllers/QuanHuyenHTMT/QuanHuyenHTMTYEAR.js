const QuanHuyenHTMTYEAR = require('../../models/quanhuyenHTMT/quanhuyenHTMTYEAR');




class QuanHuyenHTMTYEARController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await QuanHuyenHTMTYEAR.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho QuanHuyenHTMTYEAR
      const pageQuanHuyenHTMTYEAR = parseInt(req.query.pageQuanHuyenHTMTYEAR) || 1;
      const pageSizeQuanHuyenHTMTYEAR = parseInt(req.query.pageSizeQuanHuyenHTMTYEAR) || 50;

      const dataQuanHuyenHTMTYEAR = await QuanHuyenHTMTYEAR.getAllStats(pageQuanHuyenHTMTYEAR, pageSizeQuanHuyenHTMTYEAR);
 

      res.render('quanhuyenHTMT/quanhuyenHTMTyear', {
        layout: 'testdataLayout',      // <-- chỉ định layout testdata.hbs
        titleQuanHuyenHTMTYEAR: 'Danh sách quận huyện HTMT theo năm',
        dataQuanHuyenHTMTYEAR,
        pageQuanHuyenHTMTYEAR,
        pageSizeQuanHuyenHTMTYEAR,
        hasPrevQuanHuyenHTMTYEAR: pageQuanHuyenHTMTYEAR > 1,
        hasNextQuanHuyenHTMTYEAR: dataQuanHuyenHTMTYEAR.length === pageSizeQuanHuyenHTMTYEAR,
        prevPageQuanHuyenHTMTYEAR: pageQuanHuyenHTMTYEAR - 1,
        nextPageQuanHuyenHTMTYEAR: pageQuanHuyenHTMTYEAR + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new QuanHuyenHTMTYEARController();
