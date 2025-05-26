const express = require('express');
const router = express.Router();
const DVTHTMTDAYController = require('../../app/controllers/DVTHTMT/DVTHTMTDAY');

router.get('/', DVTHTMTDAYController.getAll);
router.get('/view', DVTHTMTDAYController.viewAll);

module.exports = router;
