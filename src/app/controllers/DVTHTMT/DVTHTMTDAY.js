const DVTHTMTDAY = require('../../models/dvtHTMT/dvtHTMTDAY');




class DVTHTMTDAYController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await DVTHTMTDAY.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho DVTHTMTDAY
      const pageDVTHTMTDAY = parseInt(req.query.pageDVTHTMTDAY) || 1;
      const pageSizeDVTHTMTDAY = parseInt(req.query.pageSizeDVTHTMTDAY) || 50;

      const dataDVTHTMTDAY = await DVTHTMTDAY.getAllStats(pageDVTHTMTDAY, pageSizeDVTHTMTDAY);
 

      res.render('dvtHTMT/dvtHTMTday', {
        layout: 'testdataLayout',      // <-- chỉ định layout testdata.hbs
        titleDVTHTMTDAY: 'Danh sách ĐVT HTMT theo ngày',
        dataDVTHTMTDAY,
        pageDVTHTMTDAY,
        pageSizeDVTHTMTDAY,
        hasPrevDVTHTMTDAY: pageDVTHTMTDAY > 1,
        hasNextDVTHTMTDAY: dataDVTHTMTDAY.length === pageSizeDVTHTMTDAY,
        prevPageDVTHTMTDAY: pageDVTHTMTDAY - 1,
        nextPageDVTHTMTDAY: pageDVTHTMTDAY + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }
}

module.exports = new DVTHTMTDAYController();
