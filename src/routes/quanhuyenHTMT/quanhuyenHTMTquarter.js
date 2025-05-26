const express = require('express');
const router = express.Router();
const QuanHuyenHTMTQUARTERController = require('../../app/controllers/QuanHuyenHTMT/QuanHuyenHTMTQUARTER');

router.get('/', QuanHuyenHTMTQUARTERController.getAll);
router.get('/view', QuanHuyenHTMTQUARTERController.viewAll);

module.exports = router;
