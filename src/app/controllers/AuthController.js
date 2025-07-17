const jwtHelper = require('../../helpers/jwt.helper');
const userModel = require('../models/userModel');
const ldap = require('ldapjs');
const { ldapAuthenticate } = require('../../helpers/ldapHelper'); // đường dẫn tùy theo cấu trúc dự án




const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || '3650d';
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'access-token-cntt@811@';
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || '3650d';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh-token-cntt@811@';

const tokenList = {};

class AuthController {
  // Trang login (tùy)
    loginPage(req, res) {
        res.render('login');
    }

    async viewAll(req, res) {
        try {
        res.render('person/account', {
            layout: 'accountLayout',
            title: 'Quản lý tài khoản',
            user: req.user,
        });
        } catch (err) {
        console.error('Render error:', err);
        res.status(500).render('404', { layout: 'accountLayout' });
        }
    }

    async createUserView(req, res) {
        try {
        res.render('person/create', {
            layout: 'accountLayout',
            title: 'Tạo tào khoản mới'
        });
        } catch (err) {
        console.error('Render error:', err);
        res.status(500).render('404', { layout: 'accountLayout' });
        }
    }

    async getAllUsers(req, res) {
        try {
        const users = await userModel.getAllAccounts();

        const processedUsers = users.map((r, i) => ({
            _id: r._id,
            name:r.name ||'',
            username: r.username || '',
            email: r.email || '',
            role:r.role ||'',
            department: r.department ,
            createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '',
            updateAt: r.updateAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '',
            stt: i + 1,
        }));

        res.json({ success: true, users: processedUsers });
        } catch (err) {
        console.error('❌ Error fetching users:', err);
        res.status(500).json({ success: false });
        }
    }
    // Đăng nhập
    async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
            }

            // Lấy user từ DB
            const user = await userModel.getUserByUsername(username);
            if (!user) {
            return res.status(401).json({ message: 'Bạn không có trong danh sách tài khoản.' });
            }

            // Chỉ xác thực LDAP
            const valid = await ldapAuthenticate(username, password);
            if (!valid) {
            return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
            }

            // Tạo payload JWT
            const payload = {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department,
            position: user.position,
            permissions: user.permissions,
            };

            const accessToken = await jwtHelper.generateToken(payload, accessTokenSecret, accessTokenLife);
            const refreshToken = await jwtHelper.generateToken(payload, refreshTokenSecret, refreshTokenLife);

            tokenList[refreshToken] = { accessToken, refreshToken };

            res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
            });

            res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
            accessToken,
            refreshToken,
            user: payload,
            });
        } catch (err) {
            console.error('❌ Login error:', err);
            res.status(500).json({ message: 'Lỗi server' });
        }
        }


  

    // Đăng xuất
    logout(req, res) {
    // Xoá cookies chứa token
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        // (Tuỳ chọn) Xoá token khỏi tokenList nếu đang lưu
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        if (refreshToken && tokenList[refreshToken]) {
            delete tokenList[refreshToken];
        }

        // ✅ Trả về phản hồi để client biết thành công
        res.status(200).json({ success: true, message: 'Đã đăng xuất' });
    }



    // Làm mới accessToken từ refreshToken
    async refreshToken(req, res) {
        try {
        const { refreshToken } = req.body;
        if (!refreshToken || !tokenList[refreshToken]) {
            return res.status(403).json({ message: 'Refresh token không hợp lệ' });
        }

        const decoded = await jwtHelper.verifyToken(refreshToken, refreshTokenSecret);
        const payload = decoded.data;

        const newAccessToken = await jwtHelper.generateToken({ data: payload }, accessTokenSecret, accessTokenLife);
        tokenList[refreshToken].accessToken = newAccessToken;

        res.status(200).json({ accessToken: newAccessToken });
        } catch (err) {
        res.status(500).json({ message: 'Lỗi khi làm mới token' });
        }
    }

    // Tạo user mới (chỉ admin)
    async createUser(req, res) {
    try {
        const currentUser = req.user;
        const userData = req.body;

        const insertedId = await userModel.createUser(userData, currentUser);
        res.status(201).json({
        success: true,
        message: 'Tạo người dùng thành công',
        insertedId,
        });
    } catch (err) {
        res.status(400).json({
        success: false,
        message: err.message,
        });
    }
    }

    // Sửa thông tin user (chỉ admin)
    async updateUser(req, res) {
        try {
        const currentUser = req.user;
        const id = req.params.id;
        const updateData = req.body;

        const success = await userModel.updateUser(id, updateData, currentUser);
        if (!success) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        res.json({ message: 'Cập nhật thành công' });
        } catch (err) {
        res.status(400).json({ message: err.message });
        }
    }

    // Xoá user (chỉ admin)
    async deleteUser(req, res) {
        try {
            const currentUser = req.user;

            // Kiểm tra quyền tại đây luôn
            if (!currentUser?.permissions?.canManageUsers) {
            return res.status(403).json({ 
                success: false, 
                message: 'Bạn không có quyền thực hiện thao tác này' 
            });
            }

            const id = req.params.id;
            const success = await userModel.deleteUser(id, currentUser);

            if (!success) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy người dùng' 
            });
            }

            res.json({ 
            success: true, 
            message: 'Xoá thành công' 
            });
        } catch (err) {
            res.status(400).json({ 
            success: false, 
            message: err.message 
            });
        }
        }




    // Route test
    protected(req, res) {
        res.json({ message: 'Xác thực thành công!', user: req.user });
    }

    async getProfile(req, res) {
        try {
            const userId = req.session?.userId || req.user?._id || req.headers['x-user-id'];

            if (!userId) {
            return res.status(401).render('error', { message: 'Bạn chưa đăng nhập hoặc thiếu userId' });
            }

            const user = await userModel.getCurrentUser(userId);

            if (!user) {
            return res.status(404).render('error', { message: 'Không tìm thấy người dùng' });
            }

            const { password, ...safeUser } = user;
            

            res.render('person/profile', {
            layout: 'accountLayout',
            title: 'Thông tin cá nhân',
            user: safeUser
            });
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng hiện tại:', error);
            res.status(500).render('error', { message: 'Lỗi server' });
        }
    }

    async updateSelf(req, res) {
        try {
            const userId = req.session?.userId || req.user?._id || req.headers['x-user-id'];

            if (!userId) {
            return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập' });
            }

            const success = await userModel.updateSelf(userId, req.body);

            if (success) {
            res.json({ success: true, message: 'Cập nhật thông tin thành công' });
            } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            }
        } catch (err) {
            console.error('Lỗi cập nhật thông tin:', err); // log lỗi
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }

    async changePassword(req, res) {
        try {
            const userId = req.user?._id;
            if (!userId) {
            return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập' });
            }

            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin' });
            }

            const user = await userModel.getUserById(userId);
            if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
            }

            const isMatch = await userModel.verifyPassword(user, currentPassword);
            if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
            }

            const hashedNewPassword = await userModel.hashPassword(newPassword);

            // Truyền user vào làm currentUser
            // Trong changePassword:
            const updated = await userModel.updateUser(userId, { password: newPassword }, user);


            if (!updated) {
            return res.status(500).json({ success: false, message: 'Cập nhật mật khẩu thất bại' });
            }

            res.json({ success: true, message: 'Đổi mật khẩu thành công' });
        } catch (err) {
            console.error('Lỗi đổi mật khẩu:', err);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
        }


}


module.exports = new AuthController();
