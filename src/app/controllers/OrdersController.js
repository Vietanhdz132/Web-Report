const OrderModel = require("../models/orderModel");
const authMiddleware = require("../../middleware/AuthMiddleware");

class OrderController {

    index(req, res) {
        res.render('order');

    }

    async placeOrder(req, res) {
        try {
            const order = await OrderModel.createOrder(req.body);
            res.status(201).json({ message: "Order placed successfully!", orderId: order._id });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async getOrderById(req, res) {
        try {
            const order = await OrderModel.getOrderById(req.params.id);
            if (!order) return res.status(404).json({ error: "Order not found" });
            res.json(order);
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async getAllOrders(req, res) {
        try {
            const orders = await OrderModel.getAllOrders();
            console.log("Orders from DB:", orders);  // Debug data từ DB
            res.json(orders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

}

module.exports = new OrderController();
