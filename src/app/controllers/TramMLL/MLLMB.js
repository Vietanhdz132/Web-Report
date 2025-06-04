const MLLMB = require('../../models/tramMLL/mllMB');


class MLLMBController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await MLLMB.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho MLL
      const pageMLLMB = parseInt(req.query.pageMLLMB) || 1;
      const pageSizeMLLMB = parseInt(req.query.pageSizeMLLMB) || 50;

      const dataMLLMB = await MLLMB.getAllStats(pageMLLMB, pageSizeMLLMB);
 

      res.render('testdata/mllmb', {
        layout: 'testdataLayout',   
        titleMLLMB: 'Danh sách trạm MLL MB',
        dataMLLMB,
        pageMLLMB,
        pageSizeMLLMB,
        hasPrevMLLMB: pageMLLMB > 1,
        hasNextMLLMB: dataMLLMB.length === pageSizeMLLMB,
        prevPageMLLMB: pageMLLMB - 1,
        nextPageMLLMB: pageMLLMB + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }

  async getAverageDuration(req, res) {
    try {
      const filterType = req.query.filterType || 'year';
      const data = await MLLMB.getAverageDuration(filterType, 10000);
      res.status(200).json({ success: true, filterType, data });
    } catch (error) {
      console.error('Lỗi lấy dữ liệu trung bình:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async viewAverageCard(req, res) {
    try {
      res.render('dashboard/mllMB', {
        layout: 'dashboardLayout',
        title: 'Thống kê thời gian mất liên lạc trung bình'
      });
    } catch (err) {
      console.error('Render error:', err);
      res.status(500).render('500', { layout: 'dashboardLayout' });
    }
  }
}

module.exports = new MLLMBController();
