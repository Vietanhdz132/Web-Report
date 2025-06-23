const express = require('express');
const router = express.Router();
const MLLMBController = require('../../app/controllers/DashBoard/MLLMB');

router.get('/', MLLMBController.getAll);
router.get('/view', MLLMBController.viewAll);

module.exports = router;
