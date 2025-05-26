const DVTHTMTQUARTER = require('../../models/dvtHTMT/dvtHTMTQUARTER');




class DVTHTMTQUARTERController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await DVTHTMTQUARTER.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho DVTHTMTQUARTER
      const pageDVTHTMTQUARTER = parseInt(req.query.pageDVTHTMTQUARTER) || 1;
      const pageSizeDVTHTMTQUARTER = parseInt(req.query.pageSizeDVTHTMTQUARTER) || 50;

      const dataDVTHTMTQUARTER = await DVTHTMTQUARTER.getAllStats(pageDVTHTMTQUARTER, pageSizeDVTHTMTQUARTER);
 

      res.render('dvtHTMT/dvtHTMTquarter', {
        layout: 'testdataLayout',      // <-- chỉ định layout testdata.hbs
        titleDVTHTMTQUARTER: 'Danh sách ĐVT HTMT theo quý',
        dataDVTHTMTQUARTER,
        pageDVTHTMTQUARTER,
        pageSizeDVTHTMTQUARTER,
        hasPrevDVTHTMTQUARTER: pageDVTHTMTQUARTER > 1,
        hasNextDVTHTMTQUARTER: dataDVTHTMTQUARTER.length === pageSizeDVTHTMTQUARTER,
        prevPageDVTHTMTQUARTER: pageDVTHTMTQUARTER - 1,
        nextPageDVTHTMTQUARTER: pageDVTHTMTQUARTER + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new DVTHTMTQUARTERController();
