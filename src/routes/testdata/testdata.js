const express = require('express');
const router = express.Router();
const testdataController = require('../../app/controllers/TestdataController');
const tramMLL = require('../testdata/trammll');
const tramMLLDVT = require('../testdata/trammlldvt'); // sửa lại đây đúng tên file/router
const tramMLLTVT = require('../testdata/trammlltvt');
const tramMLLTINH = require('../testdata/trammlltinh');
const tramMLLHUYEN = require('../testdata/trammllhuyen');


// Route chính
router.get('/', testdataController.index);

// Các router con
router.use('/trammll', tramMLL);
router.use('/trammlldvt', tramMLLDVT);
router.use('/trammlltvt', tramMLLTVT);
router.use('/trammlltinh', tramMLLTINH);
router.use('/trammllhuyen', tramMLLHUYEN);



module.exports = router;
