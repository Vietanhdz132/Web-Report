const QuanHuyenHTMTQUARTER = require('../../models/quanhuyenHTMT/quanhuyenHTMTQUARTER');




class QuanHuyenHTMTQUARTERController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await QuanHuyenHTMTQUARTER.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho QuanHuyenHTMTQUARTER
      const pageQuanHuyenHTMTQUARTER = parseInt(req.query.pageQuanHuyenHTMTQUARTER) || 1;
      const pageSizeQuanHuyenHTMTQUARTER = parseInt(req.query.pageSizeQuanHuyenHTMTQUARTER) || 50;

      const dataQuanHuyenHTMTQUARTER = await QuanHuyenHTMTQUARTER.getAllStats(pageQuanHuyenHTMTQUARTER, pageSizeQuanHuyenHTMTQUARTER);
 

      res.render('quanhuyenHTMT/quanhuyenHTMTquarter', {
        layout: 'testdataLayout',      // <-- chỉ định layout testdata.hbs
        titleQuanHuyenHTMTQUARTER: 'Danh sách quận huyện HTMT theo quý',
        dataQuanHuyenHTMTQUARTER,
        pageQuanHuyenHTMTQUARTER,
        pageSizeQuanHuyenHTMTQUARTER,
        hasPrevQuanHuyenHTMTQUARTER: pageQuanHuyenHTMTQUARTER > 1,
        hasNextQuanHuyenHTMTQUARTER: dataQuanHuyenHTMTQUARTER.length === pageSizeQuanHuyenHTMTQUARTER,
        prevPageQuanHuyenHTMTQUARTER: pageQuanHuyenHTMTQUARTER - 1,
        nextPageQuanHuyenHTMTQUARTER: pageQuanHuyenHTMTQUARTER + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new QuanHuyenHTMTQUARTERController();
