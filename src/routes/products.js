const express = require('express');
const router = express.Router();

const ProductsController = require('../app/controllers/ProductsController');

// NewsController.index


router.get('/', ProductsController.index);

module.exports = router;
