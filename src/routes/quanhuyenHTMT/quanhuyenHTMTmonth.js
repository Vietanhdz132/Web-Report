const express = require('express');
const router = express.Router();
const QuanHuyenHTMTMONTHController = require('../../app/controllers/QuanHuyenHTMT/QuanHuyenHTMTMONTH');

router.get('/', QuanHuyenHTMTMONTHController.getAll);
router.get('/view', QuanHuyenHTMTMONTHController.viewAll);

module.exports = router;
