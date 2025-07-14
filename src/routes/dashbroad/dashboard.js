const express = require('express');
const router = express.Router();
const dashbroadController = require('../../app/controllers/DashboardController');
const MLLMBController = require('../../app/controllers/DashBoard/MLLMB');
const ACMBController = require('../../app/controllers/DashBoard/ACMB');
const authMiddleWare = require('../../middleware/AuthMiddleware');




// Route chính
router.get('/', authMiddleWare.verifyToken, dashbroadController.index);

router.get('/average-duration', authMiddleWare.verifyToken, MLLMBController.getAverageDuration); // API
router.get('/duration-target', authMiddleWare.verifyToken, MLLMBController.getDurationTarget);
router.get('/average-duration-detail', authMiddleWare.verifyToken, MLLMBController.getAverageDurationDetail); // API
router.get('/average-duration-detail-province', authMiddleWare.verifyToken, MLLMBController.getAverageDurationDetailProvince); // API
router.get('/slicer-duration', authMiddleWare.verifyToken, MLLMBController.getSlicerOptions); // API
router.get('/average-card', authMiddleWare.verifyToken, MLLMBController.viewAverageCard)

router.get('/average-duration-ac', authMiddleWare.verifyToken, ACMBController.getAverageDurationAC); // API
router.get('/average-duration-detail-ac', authMiddleWare.verifyToken, ACMBController.getAverageDurationDetailAC); // API
router.get('/average-duration-detail-province-ac', authMiddleWare.verifyToken, ACMBController.getAverageDurationDetailProvinceAC); // API
router.get('/slicer-duration-ac', authMiddleWare.verifyToken, ACMBController.getSlicerOptionsAC); // API
router.get('/average-card-ac', authMiddleWare.verifyToken, ACMBController.viewAverageCardAC)







module.exports = router;
