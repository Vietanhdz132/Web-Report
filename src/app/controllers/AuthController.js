const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const jwtHelper = require("../../helpers/jwt.helper");
const User = require('../models/userModel');

const debug = console.log.bind(console);
// Biến cục bộ trên server này sẽ lưu trữ tạm danh sách token
// Trong dự án thực tế, nên lưu chỗ khác, có thể lưu vào Redis hoặc DB
let tokenList = {};
// Thời gian sống của token
const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || "1h";
// Mã secretKey này phải được bảo mật tuyệt đối, các bạn có thể lưu vào biến môi trường hoặc file
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access-token-secret-example-trungquandev.com-green-cat-a@";
// Thời gian sống của refreshToken
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "3650d";
// Mã secretKey này phải được bảo mật tuyệt đối, các bạn có thể lưu vào biến môi trường hoặc file
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "refresh-token-secret-example-trungquandev.com-green-cat-a@";


class AuthController {
    // Hiển thị trang đăng nhập
    loginPage(req, res) {
        res.render('auth');
    }

    // Xử lý đăng nhập
    async login(req, res) {
        try {
            console.log("📌 Nhận dữ liệu đăng nhập:", req.body);

            const { username, password } = req.body;

            // Kiểm tra dữ liệu đầu vào
            if (!username || !password) {
                return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });
            }

            // Tìm user trong database
            console.log("🔍 Đang tìm user:", username);
            const user = await User.findOne({ username });

            if (!user) {
                console.log("⚠️ Không tìm thấy tài khoản!");
                return res.status(400).json({ message: "Tài khoản không tồn tại!" });
            }

            console.log("✅ Tài khoản tồn tại, kiểm tra mật khẩu...");

            // So sánh mật khẩu đã nhập với mật khẩu đã mã hóa trong database
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log("❌ Sai mật khẩu!");
                return res.status(400).json({ message: "Sai mật khẩu!" });
            }

            console.log("🔓 Mật khẩu đúng, tạo token...");


            // Tạo token JWT
            debug(`Thực hiện tạo mã Token, [thời gian sống 1 giờ.]`);
            const accessToken = await jwtHelper.generateToken(user, accessTokenSecret, accessTokenLife);


            debug(`Thực hiện tạo mã Refresh Token, [thời gian sống 10 năm] =))`);
            const refreshToken = await jwtHelper.generateToken(user, refreshTokenSecret, refreshTokenLife);

            tokenList[refreshToken] = { accessToken, refreshToken };

            console.log("🍪 Lưu token vào cookie...");
            res.cookie("accessToken", accessToken, {
                httpOnly: true,  // Ngăn JavaScript truy cập
                secure: true,    // Chỉ gửi qua HTTPS
                sameSite: "Strict", // Ngăn chặn CSRF
                maxAge: 60 * 60 * 1000 // 1 giờ
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "Strict",
                maxAge: 10 * 365 * 24 * 60 * 60 * 1000 // 10 năm
            });

            debug(`Gửi Token và Refresh Token về cho client...`);
            console.log("✅ Đăng nhập thành công!");
            return res.status(200).json({ accessToken, refreshToken });


        } catch (err) {
            console.error("❌ Lỗi trong quá trình đăng nhập:", err);
            res.status(500).json({ message: "Lỗi server!" });
        }
    }

    async refreshToken(req, res) {
        try {
            console.log("📌 Nhận yêu cầu refresh token:", req.body);

            const { refreshToken } = req.body;

            if (!refreshToken) {
                console.log("⚠️ Không có refresh token!");
                return res.status(403).json({ message: "Không có refresh token!" });
            }

            // Kiểm tra refresh token có hợp lệ không
            if (!tokenList[refreshToken]) {
                console.log("❌ Refresh token không hợp lệ hoặc đã hết hạn!");
                return res.status(403).json({ message: "Refresh token không hợp lệ!" });
            }

            // Giải mã refresh token
            const decoded = await jwtHelper.verifyToken(refreshToken, refreshTokenSecret);
            console.log("🔍 Giải mã thành công:", decoded);

            // Tạo access token mới
            const userData = { id: decoded.data.id, username: decoded.data.username };
            console.log("🔓 Tạo access token mới...");

            const accessToken = await jwtHelper.generateToken(userData, accessTokenSecret, accessTokenLife);
            console.log("✅ Access token mới:", accessToken);

            return res.status(200).json({ accessToken });

        } catch (error) {
            console.error("❌ Lỗi trong quá trình refresh token:", error);
            return res.status(500).json({ message: "Lỗi server!" });
        }
    };


    // Route bảo vệ cần xác thực
    protectedRoute(req, res) {
        res.json({ message: 'Bạn đã truy cập vào route bảo vệ!' });
    }

    // Middleware xác thực JWT
    verifyToken(req, res, next) {
        const token = req.headers['authorization'];

        if (!token) return res.status(401).json({ message: 'Không có token!' });

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Token không hợp lệ!' });

            req.userId = decoded.userId;
            next();
        });
    }

    async register(req, res) {
        try {
            console.log("📌 Nhận dữ liệu:", req.body);  // Kiểm tra dữ liệu gửi lên

            const { username, password } = req.body;

            // Kiểm tra nếu không có username hoặc password
            if (!username || !password) {
                return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });
            }

            // Kiểm tra tài khoản có tồn tại không
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                console.log("⚠️ Tài khoản đã tồn tại!");
                return res.status(400).json({ message: "Tài khoản đã tồn tại!" });
            }

            console.log("🔐 Đang mã hóa mật khẩu...");
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("✅ Mã hóa thành công!");

            const newUser = new User({ username, password: hashedPassword });

            console.log("💾 Đang lưu vào database...");
            await newUser.save();
            console.log("✅ Lưu thành công!");

            res.status(201).json({ message: "Đăng ký thành công!" });
        } catch (error) {
            console.error("❌ Lỗi server:", error); // Log lỗi chi tiết
            res.status(500).json({ message: "Lỗi server!" });
        }
    }


}


module.exports = new AuthController();
