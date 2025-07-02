const express = require('express');
const router = express.Router();
const phongVTNController = require('../../app/controllers/Report/PhongVTN');
const reportController = require('../../app/controllers/ReportController');



// HTML view routes
router.get('/pvt/view', phongVTNController.viewAll);
router.get('/pvt/create', phongVTNController.showCreateForm);
router.get('/pvt/detail/:id', phongVTNController.viewDetail);
router.get('/pvt/exportpdf/:id/:reportName', phongVTNController.exportPdf);

// API routes (JSON)
router.get('/pvt/department/:department', phongVTNController.getReportsByDepartment);
router.get('/pvt/date-range', phongVTNController.getReportsByDateRange);
router.get('/pvt/:id', phongVTNController.getReportById);
router.get('/pvt', phongVTNController.getAllReports);
router.post('/pvt', phongVTNController.createReport);
router.put('/pvt/:id', phongVTNController.updateReport);
router.delete('/pvt/:id', phongVTNController.deleteReport);

router.get('/', reportController.index);



module.exports = router;
