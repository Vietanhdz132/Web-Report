const express = require('express');
const router = express.Router();
const QuanHuyenHTMTYEARController = require('../../app/controllers/QuanHuyenHTMT/QuanHuyenHTMTYEAR');

router.get('/', QuanHuyenHTMTYEARController.getAll);
router.get('/view', QuanHuyenHTMTYEARController.viewAll);

module.exports = router;
