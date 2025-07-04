const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/AuthController');

const { verifyToken, requireAdmin, requireRole } = require('../middleware/AuthMiddleware');



// Trang đăng nhập
router.get('/login', authController.loginPage);

// Xử lý đăng nhập (POST)
router.post('/login', authController.login);

// Đăng xuất (nếu bạn muốn)
router.post('/logout', authController.logout);



// Tạo user mới (admin)
router.post('/users',verifyToken, authController.createUser);

// Sửa user (admin)
router.put('/users/:id',verifyToken, authController.updateUser);

// Xóa user (admin)
router.delete('/users/:id',verifyToken, authController.deleteUser);

// Lấy thông tin user hiện tại
router.get('/me',verifyToken, authController.getProfile);

module.exports = router;
