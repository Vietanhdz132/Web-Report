const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, enum: ['COD', 'Bank'], required: true },
    status: { type: String, default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
