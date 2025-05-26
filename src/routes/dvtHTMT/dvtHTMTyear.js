const express = require('express');
const router = express.Router();
const DVTHTMTYEARController = require('../../app/controllers/DVTHTMT/DVTHTMTYEAR');

router.get('/', DVTHTMTYEARController.getAll);
router.get('/view', DVTHTMTYEARController.viewAll);

module.exports = router;
