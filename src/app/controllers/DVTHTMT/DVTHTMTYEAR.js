const DVTHTMTYEAR = require('../../models/dvtHTMT/dvtHTMTYEAR');




class DVTHTMTYEARController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await DVTHTMTYEAR.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho DVTHTMTYEAR
      const pageDVTHTMTYEAR = parseInt(req.query.pageDVTHTMTYEAR) || 1;
      const pageSizeDVTHTMTYEAR = parseInt(req.query.pageSizeDVTHTMTYEAR) || 50;

      const dataDVTHTMTYEAR = await DVTHTMTYEAR.getAllStats(pageDVTHTMTYEAR, pageSizeDVTHTMTYEAR);
 

      res.render('dvtHTMT/dvtHTMTyear', {
        layout: 'testdataLayout',      // <-- chỉ định layout testdata.hbs
        titleDVTHTMTYEAR: 'Danh sách ĐVT HTMT theo năm',
        dataDVTHTMTYEAR,
        pageDVTHTMTYEAR,
        pageSizeDVTHTMTYEAR,
        hasPrevDVTHTMTYEAR: pageDVTHTMTYEAR > 1,
        hasNextDVTHTMTYEAR: dataDVTHTMTYEAR.length === pageSizeDVTHTMTYEAR,
        prevPageDVTHTMTYEAR: pageDVTHTMTYEAR - 1,
        nextPageDVTHTMTYEAR: pageDVTHTMTYEAR + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new DVTHTMTYEARController();
