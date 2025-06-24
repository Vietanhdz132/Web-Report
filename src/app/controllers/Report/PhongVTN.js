const reportPVTN = require('../../models/report/phongVTN');

class PhongVTNController {
  async createReport(req, res) {
    try {
      const report = req.body;
      const insertedId = await reportPVTN.insertReport(report);
      res.status(201).json({ success: true, insertedId });
    } catch (err) {
      console.error('❌ Error creating report:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getAllReports(req, res) {
    try {
      const reports = await reportPVTN.getAllReports();
      res.json(reports);
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      res.status(500).json({ success: false });
    }
  }

  async getReportById(req, res) {
    try {
      const report = await reportPVTN.getReportById(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }
      res.json(report);
    } catch (err) {
      console.error('❌ Error fetching report by ID:', err);
      res.status(500).json({ success: false });
    }
  }

  async updateReport(req, res) {
    try {
      const count = await reportPVTN.updateReport(req.params.id, req.body);
      res.json({ success: count > 0 });
    } catch (err) {
      console.error('❌ Error updating report:', err);
      res.status(500).json({ success: false });
    }
  }

  async deleteReport(req, res) {
    try {
      const count = await reportPVTN.deleteReport(req.params.id);
      res.json({ success: count > 0 });
    } catch (err) {
      console.error('❌ Error deleting report:', err);
      res.status(500).json({ success: false });
    }
  }

  async getReportsByDepartment(req, res) {
    try {
      const reports = await reportPVTN.getReportsByDepartment(req.params.department);
      res.json(reports);
    } catch (err) {
      console.error('❌ Error fetching by department:', err);
      res.status(500).json({ success: false });
    }
  }

  async getReportsByDateRange(req, res) {
    try {
      const { start, end } = req.query;
      const reports = await reportPVTN.getReportsByDateRange(start, end);
      res.json(reports);
    } catch (err) {
      console.error('❌ Error fetching by date range:', err);
      res.status(500).json({ success: false });
    }
  }

  // (Tuỳ chọn mở rộng) – View hiển thị dạng HTML
  async viewAll(req, res) {
    try {
      res.render('report/pvtn', {
        layout: 'reportLayout',
        title: 'Báo cáo tuần Phòng vô tuyến'
      });
    } catch (err) {
      console.error('Render error:', err);
      res.status(500).render('404', { layout: 'reportLayout' });
    }
  }

  async viewDetail(req, res) {
    try {
      const report = await reportPVTN.getReportById(req.params.id);
      if (!report) return res.status(404).send('Không tìm thấy báo cáo');
      res.render('report/detail', { report });
    } catch (err) {
      res.status(500).send('Lỗi khi xem chi tiết');
    }
  }
  async showCreateForm(req, res) {
     try {
      res.render('report/create', {
        layout: 'reportLayout',
        title: 'Báo cáo tuần Phòng vô tuyến'
        
      });
    } catch (err) {
      console.error('Render error:', err);
      res.status(500).render('404', { layout: 'reportLayout' });
    }
  }
}

module.exports = new PhongVTNController();
