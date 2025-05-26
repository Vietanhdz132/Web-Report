const DVTHTMTMONTH = require('../../models/dvtHTMT/dvtHTMTMONTH');




class DVTHTMTMONTHController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await DVTHTMTMONTH.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho DVTHTMTMONTH
      const pageDVTHTMTMONTH = parseInt(req.query.pageDVTHTMTMONTH) || 1;
      const pageSizeDVTHTMTMONTH = parseInt(req.query.pageSizeDVTHTMTMONTH) || 50;

      const dataDVTHTMTMONTH = await DVTHTMTMONTH.getAllStats(pageDVTHTMTMONTH, pageSizeDVTHTMTMONTH);
 

      res.render('dvtHTMT/dvtHTMTmonth', {
        layout: 'testdataLayout',      // <-- chỉ định layout testdata.hbs
        titleDVTHTMTMONTH: 'Danh sách ĐVT HTMT theo tháng',
        dataDVTHTMTMONTH,
        pageDVTHTMTMONTH,
        pageSizeDVTHTMTMONTH,
        hasPrevDVTHTMTMONTH: pageDVTHTMTMONTH > 1,
        hasNextDVTHTMTMONTH: dataDVTHTMTMONTH.length === pageSizeDVTHTMTMONTH,
        prevPageDVTHTMTMONTH: pageDVTHTMTMONTH - 1,
        nextPageDVTHTMTMONTH: pageDVTHTMTMONTH + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new DVTHTMTMONTHController();
