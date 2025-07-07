const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/AuthController');
const authMiddleWare = require('../middleware/AuthMiddleware');




// Trang đăng nhập
router.get('/login', authController.loginPage);

router.get('/account/manager',authMiddleWare.verifyToken,authController.viewAll )

router.get('/account/getAllUsers',authMiddleWare.verifyToken,authController.getAllUsers )


// Xử lý đăng nhập (POST)
router.post('/login', authController.login);

// Đăng xuất (nếu bạn muốn)
router.post('/logout', authController.logout);

// Tạo user mới (admin)
router.post('/users',authMiddleWare.verifyToken, authController.createUser);

// Sửa user (admin)
router.put('/users/:id',authMiddleWare.verifyToken, authController.updateUser);

// Xóa user (admin)
router.delete('/users/:id',authMiddleWare.verifyToken, authController.deleteUser);

// Lấy thông tin user hiện tại
router.get('/me',authMiddleWare.verifyToken, authController.getProfile);

module.exports = router;
