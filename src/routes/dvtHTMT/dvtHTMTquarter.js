const express = require('express');
const router = express.Router();
const DVTHTMTQUARTERController = require('../../app/controllers/DVTHTMT/DVTHTMTQUARTER');

router.get('/', DVTHTMTQUARTERController.getAll);
router.get('/view', DVTHTMTQUARTERController.viewAll);

module.exports = router;
