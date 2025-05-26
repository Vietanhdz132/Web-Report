const QuanHuyenHTMTMONTH = require('../../models/quanhuyenHTMT/quanhuyenHTMTMONTH');




class QuanHuyenHTMTMONTHController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await QuanHuyenHTMTMONTH.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho QuanHuyenHTMTMONTH
      const pageQuanHuyenHTMTMONTH = parseInt(req.query.pageQuanHuyenHTMTMONTH) || 1;
      const pageSizeQuanHuyenHTMTMONTH = parseInt(req.query.pageSizeQuanHuyenHTMTMONTH) || 50;

      const dataQuanHuyenHTMTMONTH = await QuanHuyenHTMTMONTH.getAllStats(pageQuanHuyenHTMTMONTH, pageSizeQuanHuyenHTMTMONTH);
 

      res.render('quanhuyenHTMT/quanhuyenHTMTmonth', {
        layout: 'testdataLayout',      // <-- chỉ định layout testdata.hbs
        titleQuanHuyenHTMTMONTH: 'Danh sách quận huyện HTMT theo tháng',
        dataQuanHuyenHTMTMONTH,
        pageQuanHuyenHTMTMONTH,
        pageSizeQuanHuyenHTMTMONTH,
        hasPrevQuanHuyenHTMTMONTH: pageQuanHuyenHTMTMONTH > 1,
        hasNextQuanHuyenHTMTMONTH: dataQuanHuyenHTMTMONTH.length === pageSizeQuanHuyenHTMTMONTH,
        prevPageQuanHuyenHTMTMONTH: pageQuanHuyenHTMTMONTH - 1,
        nextPageQuanHuyenHTMTMONTH: pageQuanHuyenHTMTMONTH + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new QuanHuyenHTMTMONTHController();
