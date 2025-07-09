const express = require('express');
const router = express.Router();
const testdataController = require('../../app/controllers/TestdataController');
const authMiddleWare = require('../../middleware/AuthMiddleware');

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
router.use('/mllmb',authMiddleWare.verifyToken, MLLMB);
router.use('/trammll',authMiddleWare.verifyToken, tramMLL);
router.use('/trammlldvt',authMiddleWare.verifyToken, tramMLLDVT);
router.use('/trammlltvt',authMiddleWare.verifyToken, tramMLLTVT);
router.use('/trammlltinh',authMiddleWare.verifyToken, tramMLLTINH);
router.use('/trammllhuyen',authMiddleWare.verifyToken, tramMLLHUYEN);

router.use('/quanhuyenHTMTyear',authMiddleWare.verifyToken, quanhuyenHTMTYEAR);
router.use('/quanhuyenHTMTquarter',authMiddleWare.verifyToken, quanhuyenHTMTQUARTER);
router.use('/quanhuyenHTMTmonth',authMiddleWare.verifyToken, quanhuyenHTMTMONTH);
router.use('/quanhuyenHTMTweek',authMiddleWare.verifyToken, quanhuyenHTMTWEEK);
router.use('/quanhuyenHTMTday',authMiddleWare.verifyToken, quanhuyenHTMTDAY);

router.use('/dvtHTMTyear',authMiddleWare.verifyToken, dvtHTMTYEAR);
router.use('/dvtHTMTquarter',authMiddleWare.verifyToken, dvtHTMTQUARTER);
router.use('/dvtHTMTmonth',authMiddleWare.verifyToken, dvtHTMTMONTH);
router.use('/dvtHTMTweek',authMiddleWare.verifyToken, dvtHTMTWEEK);
router.use('/dvtHTMTday',authMiddleWare.verifyToken, dvtHTMTDAY);

module.exports = router;
