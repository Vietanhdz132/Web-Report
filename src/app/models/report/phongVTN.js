const reportPVTN = require('../../models/report/phongVTN');
const { ObjectId } = require('mongodb');

class PhongVTNController {
  /**
   * [POST] /report/create - Tạo báo cáo mới
   */
  async createReport(req, res) {
    try {
      const body = req.body;

      // Gộp và chuẩn hóa dữ liệu nếu cần
      const report = {
        week: parseInt(body.week),
        number: body.number,
        createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
        department: 'Phòng Vô Tuyến',
        sections: body.sections || {},
        receivers: body.receivers || '',
        signer: body.signer || '',
        position: body.position || ''
      };

      const insertedId = await reportPVTN.insertReport(report);
      res.status(201).json({ success: true, insertedId });
    } catch (err) {
      console.error('❌ Error creating report:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * [GET] /report - Lấy tất cả báo cáo
   */
  async getAllReports(req, res) {
    try {
      const reports = await reportPVTN.getAllReports();
      res.json(reports);
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      res.status(500).json({ success: false });
    }
  }

  /**
   * [GET] /report/:id - Lấy báo cáo theo ID
   */
  async getReportById(req, res) {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID' });
      }

      const report = await reportPVTN.getReportById(id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      res.json(report);
    } catch (err) {
      console.error('❌ Error fetching report by ID:', err);
      res.status(500).json({ success: false });
    }
  }

  /**
   * [PUT] /report/:id - Cập nhật báo cáo
   */
  async updateReport(req, res) {
    try {
      const id = req.params.id;
      const update = req.body;

      const count = await reportPVTN.updateReport(id, update);
      res.json({ success: count > 0 });
    } catch (err) {
      console.error('❌ Error updating report:', err);
      res.status(500).json({ success: false });
    }
  }

  /**
   * [DELETE] /report/:id - Xóa báo cáo
   */
  async deleteReport(req, res) {
    try {
      const id = req.params.id;
      const count = await reportPVTN.deleteReport(id);
      res.json({ success: count > 0 });
    } catch (err) {
      console.error('❌ Error deleting report:', err);
      res.status(500).json({ success: false });
    }
  }

  /**
   * [GET] /report/department/:department
   */
  async getReportsByDepartment(req, res) {
    try {
      const { department } = req.params;
      const reports = await reportPVTN.getReportsByDepartment(department);
      res.json(reports);
    } catch (err) {
      console.error('❌ Error fetching by department:', err);
      res.status(500).json({ success: false });
    }
  }

  /**
   * [GET] /report/range?start=yyyy-mm-dd&end=yyyy-mm-dd
   */
  async getReportsByDateRange(req, res) {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({ success: false, message: 'Missing date range' });
      }

      const reports = await reportPVTN.getReportsByDateRange(start, end);
      res.json(reports);
    } catch (err) {
      console.error('❌ Error fetching by date range:', err);
      res.status(500).json({ success: false });
    }
  }

  /**
   * [GET] /report/view - Giao diện danh sách HTML
   */
  async viewAll(req, res) {
    try {
      res.render('report/pvtn', {
        layout: 'reportLayout',
        title: 'Báo cáo tuần Phòng Vô Tuyến'
      });
    } catch (err) {
      console.error('Render error:', err);
      res.status(500).render('404', { layout: 'reportLayout' });
    }
  }

  /**
   * [GET] /report/detail/:id - Giao diện chi tiết báo cáo
   */
  async viewDetail(req, res) {
    try {
      const report = await reportPVTN.getReportById(req.params.id);
      if (!report) return res.status(404).send('Không tìm thấy báo cáo');
      res.render('report/detail', { report });
    } catch (err) {
      res.status(500).send('Lỗi khi xem chi tiết');
    }
  }

  /**
   * [GET] /report/create - Giao diện tạo báo cáo
   */
  async showCreateForm(req, res) {
    try {
      res.render('report/create', {
        layout: 'reportLayout',
        title: 'Tạo Báo Cáo Tuần - Phòng Vô Tuyến'
      });
    } catch (err) {
      console.error('Render error:', err);
      res.status(500).render('404', { layout: 'reportLayout' });
    }
  }
}

module.exports = new PhongVTNController();
