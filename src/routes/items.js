const express = require('express');
const router = express.Router();

const itemController = require('../app/controllers/ItemController');

// NewsController.index

router.get('/:slug', itemController.show);

module.exports = router;
