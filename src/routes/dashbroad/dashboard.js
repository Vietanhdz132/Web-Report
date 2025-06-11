const express = require('express');
const router = express.Router();
const dashbroadController = require('../../app/controllers/DashboardController');
const MLLMBController = require('../../app/controllers/TramMLL/MLLMB');



// Route chính
router.get('/', dashbroadController.index);
router.get('/average-duration', MLLMBController.getAverageDuration); // API
router.get('/average-duration-detail', MLLMBController.getAverageDurationDetail); // API
router.get('/average-duration-detail-province', MLLMBController.getAverageDurationDetailProvince); // API
router.get('/slicer-duration', MLLMBController.getSlicerOptions); // API
router.get('/average-card', MLLMBController.viewAverageCard)

// Các router con






module.exports = router;
