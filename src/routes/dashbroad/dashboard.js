const express = require('express');
const router = express.Router();
const dashbroadController = require('../../app/controllers/DashboardController');




// Route chính
router.get('/', dashbroadController.index);

// Các router con






module.exports = router;
