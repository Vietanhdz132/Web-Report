const express = require('express');
const router = express.Router();
const testdataController = require('../../app/controllers/TestdataController');
const tramMLL = require('../testdata/trammll');
const tramMLLDVT = require('../testdata/trammlldvt'); // sửa lại đây đúng tên file/router
const tramMLLTVT = require('../testdata/trammlltvt');
const tramMLLTINH = require('../testdata/trammlltinh');
const tramMLLHUYEN = require('../testdata/trammllhuyen');
const quanhuyenHTMTYEAR = require('../quanhuyenHTMT/quanhuyenHTMTyear');
const quanhuyenHTMTQUARTER = require('../quanhuyenHTMT/quanhuyenHTMTquarter');
const quanhuyenHTMTMONTH = require('../quanhuyenHTMT/quanhuyenHTMTmonth');
const quanhuyenHTMTWEEK = require('../quanhuyenHTMT/quanhuyenHTMTweek');
const quanhuyenHTMTDAY = require('../quanhuyenHTMT/quanhuyenHTMTday');




// Route chính
router.get('/', testdataController.index);

// Các router con
router.use('/trammll', tramMLL);
router.use('/trammlldvt', tramMLLDVT);
router.use('/trammlltvt', tramMLLTVT);
router.use('/trammlltinh', tramMLLTINH);
router.use('/trammllhuyen', tramMLLHUYEN);
router.use('/quanhuyenHTMTyear', quanhuyenHTMTYEAR);
router.use('/quanhuyenHTMTquarter', quanhuyenHTMTQUARTER);
router.use('/quanhuyenHTMTmonth', quanhuyenHTMTMONTH);
router.use('/quanhuyenHTMTweek', quanhuyenHTMTWEEK);
router.use('/quanhuyenHTMTday', quanhuyenHTMTDAY);





module.exports = router;
