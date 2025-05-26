const express = require('express');
const router = express.Router();
const QuanHuyenHTMTYEARController = require('../../app/controllers/QuanHuyenHTMT/QuanHuyenHTMTDAY');

router.get('/', QuanHuyenHTMTYEARController.getAll);
router.get('/view', QuanHuyenHTMTYEARController.viewAll);

module.exports = router;
