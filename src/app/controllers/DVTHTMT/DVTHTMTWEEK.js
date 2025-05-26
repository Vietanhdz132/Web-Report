const DVTHTMTWEEK = require('../../models/dvtHTMT/dvtHTMTWEEK');




class DVTHTMTWEEKController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await DVTHTMTWEEK.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho DVTHTMTWEEK
      const pageDVTHTMTWEEK = parseInt(req.query.pageDVTHTMTWEEK) || 1;
      const pageSizeDVTHTMTWEEK = parseInt(req.query.pageSizeDVTHTMTWEEK) || 50;

      const dataDVTHTMTWEEK = await DVTHTMTWEEK.getAllStats(pageDVTHTMTWEEK, pageSizeDVTHTMTWEEK);
 

      res.render('dvtHTMT/dvtHTMTweek', {
        layout: 'testdataLayout',      // <-- chỉ định layout testdata.hbs
        titleDVTHTMTWEEK: 'Danh sách ĐVT HTMT theo tuần',
        dataDVTHTMTWEEK,
        pageDVTHTMTWEEK,
        pageSizeDVTHTMTWEEK,
        hasPrevDVTHTMTWEEK: pageDVTHTMTWEEK > 1,
        hasNextDVTHTMTWEEK: dataDVTHTMTWEEK.length === pageSizeDVTHTMTWEEK,
        prevPageDVTHTMTWEEK: pageDVTHTMTWEEK - 1,
        nextPageDVTHTMTWEEK: pageDVTHTMTWEEK + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new DVTHTMTWEEKController();
