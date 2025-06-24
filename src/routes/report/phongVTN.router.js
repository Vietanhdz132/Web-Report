const express = require('express');
const router = express.Router();
const phongVTNController = require('../../app/controllers/Report/PhongVTN');
const reportController = require('../../app/controllers/ReportController');


// API JSON
// router.post('/pvt/add', phongVTNController.createReport);
// router.get('/pvt/all', phongVTNController.getAllReports);
// router.get('/pvt/:id', phongVTNController.getReportById);
// router.put('/pvt/:id', phongVTNController.updateReport);
// router.delete('/pvt/:id', phongVTNController.deleteReport);
// router.get('/pvt/by-department/:department', phongVTNController.getReportsByDepartment);
// router.get('/pvt/by-date', phongVTNController.getReportsByDateRange);

// View HTML
router.get('/pvt/view', phongVTNController.viewAll);
router.get('/pvt/view/:id', phongVTNController.viewDetail);
router.get('/pvt/create', phongVTNController.showCreateForm);

router.get('/', reportController.index);


module.exports = router;
