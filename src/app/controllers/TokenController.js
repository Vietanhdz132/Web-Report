class TokenController {
    async receiveToken(req, res) {
        try {
            const token = req.headers.authorization?.split(" ")[1];; // Nhận token từ request body
            console.log(token)

            if (!token) {
                return res.status(400).json({ message: '❌ Không có token trong yêu cầu' });
            }

            // (Tuỳ chọn) Lưu token vào database
            // await TokenModel.create({ token });

            console.log('✅ Đã nhận Token:', token);

            res.status(200).json({ message: '✅ Token đã nhận thành công' });
        } catch (error) {
            console.error('⚠ Lỗi khi nhận token:', error);
            res.status(500).json({ message: '⚠ Lỗi hệ thống!' });
        }
    }
}

module.exports = new TokenController();
