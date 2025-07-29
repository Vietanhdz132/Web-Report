const reportPVTN = require('../../models/report/phongVTN');
const { ObjectId } = require('mongodb');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

class PhongVTNController {
  /**
   * [POST] /report/create - Tạo báo cáo mới
   */
  async createReport(req, res) {
    try {
      const body = req.body;
      const currentUser = req.user || {};
      // Chuẩn hóa dữ liệu đầu vào nếu cần
      const report = {
        reportName: body.reportName || '',
        recipient: body.recipient || '',
        number: body.number || '',
        createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
        username: body.username||'Không xác định',
        department: 'Phòng Vô Tuyến',
        sections: body.sections || {}, // phần này bạn cần đảm bảo frontend gửi đúng
        receivers: body.receivers || '',
        signer: body.signer || '',
        position: body.position || '',
        createdBy: {
          name: currentUser.name || 'Unknown',
          email: currentUser.email || '',
          _id: currentUser._id || null,
      }
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

      const processedReports = reports
        .filter(r => String(r._id) !== "6875bbc36fdf72698308d501") // ép về string
        .map((r, i) => ({
          _id: r._id,
          number: r.number || '',
          reportName: r.reportName || '',
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '',
          username: r.username,
          department: r.department,
          stt: i + 1,
        }));


      res.json({ success: true, reports: processedReports });
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
        return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      }

      const report = await reportPVTN.getReportById(id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
      }

      return res.json({ success: true, data: report });
    } catch (err) {
      console.error('❌ Error fetching report by ID:', err);
      return res.status(500).json({ success: false });
    }
  }


  /**
   * [PUT] /report/:id - Cập nhật báo cáo
   */
  async updateReport(req, res) {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      }

      const update = req.body;
      // Có thể thêm validate update nếu cần

      const count = await reportPVTN.updateReport(id, update);
      if (count > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo để cập nhật' });
      }
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
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      }

      const count = await reportPVTN.deleteReport(id);
      if (count > 0) {
        return res.json({ success: true, message: 'Xóa báo cáo thành công' });
      } else {
        return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo để xóa' });
      }
    } catch (err) {
      console.error('❌ Error deleting report:', err);
      return res.status(500).json({ success: false, message: 'Lỗi server khi xóa báo cáo' });
    }
  }


  /**
   * [GET] /report/department/:department - Lấy báo cáo theo phòng ban
   */
  async getReportsByDepartment(req, res) {
    try {
      const department = req.params.department;
      if (!department) {
        return res.status(400).json({ success: false, message: 'Thiếu phòng ban' });
      }

      const reports = await reportPVTN.getReportsByDepartment(department);
      res.json(reports);
    } catch (err) {
      console.error('❌ Error fetching by department:', err);
      res.status(500).json({ success: false });
    }
  }

  /**
   * [GET] /report/range?start=yyyy-mm-dd&end=yyyy-mm-dd - Lấy báo cáo theo khoảng ngày
   */
  async getReportsByDateRange(req, res) {
    try {
      const { start, end } = req.query;
      if (!start || !end) {
        return res.status(400).json({ success: false, message: 'Thiếu khoảng ngày' });
      }

      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).json({ success: false, message: 'Ngày không hợp lệ' });
      }

      const reports = await reportPVTN.getReportsByDateRange(startDate, endDate);
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
        title: 'Báo cáo tuần Phòng Vô Tuyến',
        user: req.user
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
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send('ID không hợp lệ');
      }

      const report = await reportPVTN.getReportById(id);
      
      if (!report) return res.status(404).send('Không tìm thấy báo cáo');
      // console.log('📝 Dữ liệu báo cáo:', JSON.stringify(report, null, 2));

      res.render('report/viewreport', {
        layout: 'reportLayout',
        report,
        nextWeek: report.number ? parseInt(report.number) + 1 : 'TỚI',
      
      });
    } catch (err) {
      console.error('❌ Error khi xem chi tiết:', err);
      res.status(500).send('Lỗi khi xem chi tiết');
    }
  }

    async exportPdf(req, res) {
      try {
        const id = req.params.id;
        const rawReportName = decodeURIComponent(req.params.reportName || '');
        const safeReportName = rawReportName
          .normalize("NFD").replace(/[\u0300-\u036f]/g, '') // bỏ dấu tiếng Việt
          .replace(/[^a-zA-Z0-9-_ ]/g, '')                 // bỏ ký tự đặc biệt
          .replace(/\s+/g, '_')                            // thay khoảng trắng bằng "_"
          .toUpperCase();                                  // viết hoa nếu bạn thích

        if (!ObjectId.isValid(id)) {
          return res.status(400).send('ID không hợp lệ');
        }

        const reportUrl = `http://localhost:3000/report/pvt/detail/${id}`;
        const browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // ✅ Gửi token xác thực đặc biệt qua header
        await page.setExtraHTTPHeaders({
          'x-export-token': process.env.EXPORT_PDF_SECRET
        });

        console.log('📄 Puppeteer đang truy cập:', reportUrl);

        // ✅ Truy cập trang chi tiết báo cáo với token đặc biệt
        await page.goto(reportUrl, {
          waitUntil: 'networkidle0',
          timeout: 0 // không timeout giới hạn (tùy chọn)
        });

        // Lấy CSS từ trang
        const cssHrefs = await page.$$eval('link[rel="stylesheet"]', links =>
          links.map(link => link.href)
        );

        // Lấy phần nội dung báo cáo
        const reportHtml = await page.$eval('.report-pvt-view', el => el.outerHTML);

        // Tạo trang in
        const printPage = await browser.newPage();

        const cssLinksHtml = cssHrefs.map(href => `<link rel="stylesheet" href="${href}">`).join('\n');
        const overrideStyle = `
          <style>
            .report-pvt-view {
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            .report-footer-container {
              break-inside: avoid;
              page-break-inside: avoid;
              -webkit-column-break-inside: avoid;
              
            }
            .button-container {
              display: none !important;
            }
            
            .subitem-text a {
              font-family: 'Times New Roman', serif;
              color: #007bff;
              text-decoration: underline;
              word-break: break-all;
            }

            .subitem-text a:hover {
              color: #0056b3;
              text-decoration: none;
            }
          </style>
        `;

        // Load HTML để in
        await printPage.setContent(`
          <html>
            <head>
              ${cssLinksHtml}
              ${overrideStyle}
            </head>
            <body>
              ${reportHtml}
            </body>
          </html>
        `, { waitUntil: 'networkidle0' });

        // Xuất PDF
        const pdfBuffer = await printPage.pdf({
          format: 'A4',
          landscape: true,
          printBackground: true,
          margin: { top: '10mm', bottom: '10mm', left: '15mm', right: '10mm' },
          scale: 0.9
        });

        await browser.close();

        // Lưu tạm file debug (nếu cần)
        const debugFolder = path.resolve(__dirname, '../debug');
        if (!fs.existsSync(debugFolder)) fs.mkdirSync(debugFolder);
        fs.writeFileSync(path.join(debugFolder, `report-${id}.pdf`), pdfBuffer);

        // Gửi file về client
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeReportName}_PVTN.pdf"`,
          'Content-Length': pdfBuffer.length
        });
        res.end(pdfBuffer);

      } catch (err) {
        console.error('❌ Lỗi khi xuất PDF:', err);
        res.status(500).send('Lỗi khi xuất PDF');
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

  async showCreateFormEx(req, res) {
    try {
      res.render('report/createEx', {
        layout: 'reportLayout',
        title: 'Tạo Báo Cáo Tuần - Phòng Vô Tuyến'
      });
    } catch (err) {
      console.error('Render error:', err);
      res.status(500).render('404', { layout: 'reportLayout' });
    }
  }


  async showEditForm(req, res) {
    try {
      res.render('report/edit', {
        layout: 'reportLayout',
        title: 'Sửa Báo Cáo Tuần - Phòng Vô Tuyến',
        user: req.user
      });
    } catch (err) {
      console.error('Render error:', err);
      res.status(500).render('404', { layout: 'reportLayout' });
    }
  }

  /**
 * [POST] /report/pvt/:id/copy - Sao chép báo cáo và trả về ID mới
 */
  async copyReport(req, res) {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      }

      const originalReport = await reportPVTN.getReportById(id);
      if (!originalReport) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo để sao chép' });
      }

      // Xóa _id để chèn mới
      delete originalReport._id;

      // Ghi chú là bản sao
      originalReport.reportName = `[Bản sao] ${originalReport.reportName}`;
      originalReport.createdAt = new Date();
      originalReport.username = req.user?.name || '';

      const newId = await reportPVTN.insertReport(originalReport);
      res.json({ success: true, newReportId: newId });
    } catch (err) {
      console.error('❌ Lỗi khi sao chép báo cáo:', err);
      res.status(500).json({ success: false, message: 'Lỗi server khi sao chép báo cáo' });
    }
  }

}



module.exports = new PhongVTNController();
