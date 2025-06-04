const express = require('express');
const router = express.Router();
const testdataController = require('../../app/controllers/TestdataController');

const MLLMB = require('../testdata/mllmb');
const tramMLL = require('../testdata/trammll');
const tramMLLDVT = require('../testdata/trammlldvt'); 
const tramMLLTVT = require('../testdata/trammlltvt');
const tramMLLTINH = require('../testdata/trammlltinh');
const tramMLLHUYEN = require('../testdata/trammllhuyen');

const quanhuyenHTMTYEAR = require('../quanhuyenHTMT/quanhuyenHTMTyear');
const quanhuyenHTMTQUARTER = require('../quanhuyenHTMT/quanhuyenHTMTquarter');
const quanhuyenHTMTMONTH = require('../quanhuyenHTMT/quanhuyenHTMTmonth');
const quanhuyenHTMTWEEK = require('../quanhuyenHTMT/quanhuyenHTMTweek');
const quanhuyenHTMTDAY = require('../quanhuyenHTMT/quanhuyenHTMTday');

const dvtHTMTYEAR = require('../dvtHTMT/dvtHTMTyear');
const dvtHTMTQUARTER = require('../dvtHTMT/dvtHTMTquarter');
const dvtHTMTMONTH = require('../dvtHTMT/dvtHTMTmonth');
const dvtHTMTWEEK = require('../dvtHTMT/dvtHTMTweek');
const dvtHTMTDAY = require('../dvtHTMT/dvtHTMTday');


// Route chính
router.get('/', testdataController.index);

// Các router con
router.use('/mllmb', MLLMB);
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

router.use('/dvtHTMTyear', dvtHTMTYEAR);
router.use('/dvtHTMTquarter', dvtHTMTQUARTER);
router.use('/dvtHTMTmonth', dvtHTMTMONTH);
router.use('/dvtHTMTweek', dvtHTMTWEEK);
router.use('/dvtHTMTday', dvtHTMTDAY);





module.exports = router;
