const express = require('express');
const router = express.Router();
const phongVTNController = require('../../app/controllers/Report/PhongVTN');
const reportController = require('../../app/controllers/ReportController');
const authMiddleWare = require('../../middleware/AuthMiddleware'); 

// HTML view routes
router.get('/pvt/view', authMiddleWare.verifyToken, authMiddleWare.requirePermission('canViewReports'), phongVTNController.viewAll);
router.get('/pvt/create',authMiddleWare.verifyToken,authMiddleWare.requirePermission('canCreateReports'), phongVTNController.showCreateForm);
router.get('/pvt/createEx',authMiddleWare.verifyToken,authMiddleWare.requirePermission('canCreateReports'), phongVTNController.showCreateFormEx);
router.get('/pvt/edit/:id',authMiddleWare.verifyToken,authMiddleWare.requirePermission('canCreateReports'), phongVTNController.showEditForm);
router.get('/pvt/detail/:id',(req, res, next) => {
    if (req.headers['x-export-token']) 
        return authMiddleWare.checkExportToken(req, res, next);
        return authMiddleWare.verifyToken(req, res, () =>authMiddleWare.requirePermission('canViewReports')(req, res, next));},
    phongVTNController.viewDetail
);

router.get('/pvt/exportpdf/:id/:reportName',authMiddleWare.verifyToken,authMiddleWare.requirePermission('canViewReports'),phongVTNController.exportPdf);

// API routes (JSON)
router.get('/pvt/department/:department',authMiddleWare.verifyToken,authMiddleWare.requirePermission('canViewReports'),phongVTNController.getReportsByDepartment);
router.get('/pvt/date-range',authMiddleWare.verifyToken,authMiddleWare.requirePermission('canViewReports'),phongVTNController.getReportsByDateRange);
router.get('/pvt/:id',authMiddleWare.verifyToken,authMiddleWare.requirePermission('canViewReports'),phongVTNController.getReportById);
router.get('/pvt',authMiddleWare.verifyToken,authMiddleWare.requirePermission('canViewReports'),phongVTNController.getAllReports);

// Tạo, sửa, xóa báo cáo – chỉ user có quyền tạo mới được
router.post('/pvt',authMiddleWare.verifyToken,authMiddleWare.requirePermission('canCreateReports'),phongVTNController.createReport);
// [POST] /report/pvt/copy/:id – sao chép báo cáo và trả về ID mới
router.post('/pvt/copy/:id',authMiddleWare.verifyToken,authMiddleWare.requirePermission('canCreateReports'),phongVTNController.copyReport);

router.put('/pvt/:id',authMiddleWare.verifyToken,authMiddleWare.requirePermission('canEditReports'),phongVTNController.updateReport);
router.delete('/pvt/:id',authMiddleWare.verifyToken,authMiddleWare.requirePermission('canDeleteReports'),phongVTNController.deleteReport);

router.get('/', reportController.index);

module.exports = router;
