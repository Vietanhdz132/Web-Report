const express = require('express');
const router = express.Router();
const TokenController = require('../app/controllers/TokenController');

router.post('/', TokenController.receiveToken);

module.exports = router;
