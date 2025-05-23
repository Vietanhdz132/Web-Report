const express = require("express");
const router = express.Router();
const OrderController = require("../app/controllers/OrdersController");


router.get('/', OrderController.index);

module.exports = router;
