const express = require('express');
const router = express.Router();
const DVTHTMTWEEKController = require('../../app/controllers/DVTHTMT/DVTHTMTWEEK');

router.get('/', DVTHTMTWEEKController.getAll);
router.get('/view', DVTHTMTWEEKController.viewAll);

module.exports = router;
