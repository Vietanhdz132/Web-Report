const ACMB = require('../../models/dashboard/acMB');


class ACMBController {
  // GET: Trả dữ liệu JSON có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const data = await ACMB.getAllStats(page, pageSize);
      res.status(200).json({ success: true, page, pageSize, data });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET: Render dữ liệu ra HTML có phân trang
  async viewAll(req, res) {
    try {
      // Phân trang riêng cho AC
      const pageACMB = parseInt(req.query.pageACMB) || 1;
      const pageSizeACMB = parseInt(req.query.pageSizeACMB) || 50;

      const dataACMB = await ACMB.getAllStats(pageACMB, pageSizeACMB);
 

      res.render('testdata/acmb', {
        layout: 'testdataLayout',   
        titleACMB: 'Danh sách trạm AC MB',
        dataACMB,
        pageACMB,
        pageSizeACMB,
        hasPrevLMB: pageACMB > 1,
        hasNextACMB: dataACMB.length === pageSizeACMB,
        prevPageACMB: pageACMB - 1,
        nextPageMLACMB: pageACMB + 1,
      });

    } catch (error) {
      console.error('Render error:', error);
      res.status(404).render('404', { layout: 'testdataLayout' });
    }

  }


  async getSlicerOptionsAC(req, res) {
    try {
    const data = await ACMB.getSlicerOptionsAC();

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

  async getAverageDurationAC(req, res) {
    try {
      const { dvt, year, month, day } = req.query;

      // Lấy dữ liệu chi tiết từ DB
      const rows = await ACMB.getAverageDurationAC({ dvt, year, month, day });

      // Nhóm dữ liệu theo DVT và PERIOD
      const groupedData = rows.reduce((acc, row) => {
        const key = `${row.DVT}|${row.PERIOD}`
        if (!acc[key]) acc[key] = { DVT: row.DVT, PERIOD: row.PERIOD, items: [] };
        acc[key].items.push(row);
        return acc;
      }, {});

      // Convert object thành mảng
      const response = Object.values(groupedData);

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Error in averageDurationHandler:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  

  async getAverageDurationDetailAC(req, res) {
    try {
      const { dvt, year, month, day } = req.query;

      // Lấy dữ liệu chi tiết từ DB
      const rows = await ACMB.getAverageDurationDetailAC({ dvt, year, month, day });

      // Nhóm dữ liệu theo DVT và PERIOD
      const groupedData = rows.reduce((acc, row) => {
        const key = `${row.DVT}|${row.PERIOD}`
        if (!acc[key]) acc[key] = { DVT: row.DVT, PERIOD: row.PERIOD, items: [] };
        acc[key].items.push(row);
        return acc;
      }, {});

      // Convert object thành mảng
      const response = Object.values(groupedData);

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Error in averageDurationHandler:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async getAverageDurationDetailProvinceAC(req, res) {
      try {
        const { dvt, year, month, day } = req.query;
        const rows = await ACMB.getAverageDurationDetailProvinceAC({ dvt, year, month, day });

        const groupedData = rows.reduce((acc, row) => {
          const key = `${row.DVT}|${row.PERIOD}`;
          if (!acc[key]) acc[key] = { DVT: row.DVT, PERIOD: row.PERIOD, items: [] };
          acc[key].items.push(row); // mỗi row giờ sẽ có thêm PROVINCE
          return acc;
        }, {});



        // Convert object thành mảng
        const response = Object.values(groupedData);

        res.json({
          success: true,
          data: response,
        });
      } catch (error) {
        console.error('Error in averageDurationHandler:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Internal server error',
        });
      }
  }

  async viewAverageCardAC(req, res) {
    try {
      res.render('dashboard/acMB', {
        layout: 'dashboardLayout',
        title: 'Thống kê thời gian mất liên lạc trung bình'
      });
    } catch (err) {
      console.error('Render error:', err);
      res.status(500).render('500', { layout: 'dashboardLayout' });
    }
  }

  
}

  

module.exports = new ACMBController();
