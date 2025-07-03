const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/AuthController');


router.post('/receive-token', (req, res) => {
    const { token } = req.body;  // Lấy token từ body request

    if (!token) {
        return res.status(400).json({ message: 'Không có token trong yêu cầu' });
    }

    // Bạn có thể lưu token vào cơ sở dữ liệu hoặc xử lý thêm nếu cần
    console.log('Đã nhận được Token');  // In token ra console hoặc xử lý theo nhu cầu của bạn

    // Trả về thông báo thành công
    res.status(200).json({ message: 'Token đã nhận thành công' });
});
router.post('/login', authController.login);
router.post("/refresh-token", authController.refreshToken);
router.get('/protected', authController.verifyToken, authController.protectedRoute);
router.post('/register', authController.register)
// router.get('/', authController.loginPage)
router.get('/login', authController.loginPage);

module.exports = router;
