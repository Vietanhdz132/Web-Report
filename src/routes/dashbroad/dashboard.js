const express = require('express');
const router = express.Router();
const dashbroadController = require('../../app/controllers/DashboardController');
const MLLMBController = require('../../app/controllers/DashBoard/MLLMB');
const ACMBController = require('../../app/controllers/DashBoard/ACMB');




// Route chính
router.get('/', dashbroadController.index);
router.get('/average-duration', MLLMBController.getAverageDuration); // API
router.get('/duration-target', MLLMBController.getDurationTarget);
router.get('/average-duration-detail', MLLMBController.getAverageDurationDetail); // API
router.get('/average-duration-detail-province', MLLMBController.getAverageDurationDetailProvince); // API
router.get('/slicer-duration', MLLMBController.getSlicerOptions); // API
router.get('/average-card', MLLMBController.viewAverageCard)

router.get('/average-duration-ac', ACMBController.getAverageDurationAC); // API
router.get('/average-duration-detail-ac', ACMBController.getAverageDurationDetailAC); // API
router.get('/average-duration-detail-province-ac', ACMBController.getAverageDurationDetailProvinceAC); // API
router.get('/slicer-duration-ac', ACMBController.getSlicerOptionsAC); // API
router.get('/average-card-ac', ACMBController.viewAverageCardAC)
// Các router con






module.exports = router;
