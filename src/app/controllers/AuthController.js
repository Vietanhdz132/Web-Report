const jwtHelper = require('../../helpers/jwt.helper');
const {
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  verifyPassword
} = require('../models/userModel');

const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || '1h';
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'access-token-cntt@811@';
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || '3650d';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh-token-cntt@811@';

const tokenList = {};

class AuthController {
  // Trang login (tùy)
  loginPage(req, res) {
    res.render('login');
  }

  // Đăng nhập
  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
      }

      const user = await getUserByUsername(username);
      const valid = await verifyPassword(user, password);

      if (!user || !valid) {
        return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
      }

      const payload = {
        id: user._id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      };

      const accessToken = await jwtHelper.generateToken({ data: payload }, accessTokenSecret, accessTokenLife);
      const refreshToken = await jwtHelper.generateToken({ data: payload }, refreshTokenSecret, refreshTokenLife);

      tokenList[refreshToken] = { accessToken, refreshToken };

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 60 * 60 * 1000
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 10 * 365 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        accessToken,
        refreshToken,
        user: payload
      });
    } catch (err) {
      console.error('❌ Login error:', err);
      res.status(500).json({ message: 'Lỗi server' });
    }
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

      const insertedId = await createUser(userData, currentUser);
      res.status(201).json({ message: 'Tạo người dùng thành công', insertedId });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // Sửa thông tin user (chỉ admin)
  async updateUser(req, res) {
    try {
      const currentUser = req.user;
      const id = req.params.id;
      const updateData = req.body;

      const success = await updateUser(id, updateData, currentUser);
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
      const id = req.params.id;

      const success = await deleteUser(id, currentUser);
      if (!success) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

      res.json({ message: 'Xoá thành công' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // Route test
  protected(req, res) {
    res.json({ message: 'Xác thực thành công!', user: req.user });
  }
}

module.exports = new AuthController();
