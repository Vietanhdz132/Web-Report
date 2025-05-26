const express = require('express');
const router = express.Router();
const DVTHTMTMONTHController = require('../../app/controllers/DVTHTMT/DVTHTMTMONTH');

router.get('/', DVTHTMTMONTHController.getAll);
router.get('/view', DVTHTMTMONTHController.viewAll);

module.exports = router;
