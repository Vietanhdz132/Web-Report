const jwtHelper = require("../helpers/jwt.helper");
const debug = console.log.bind(console);

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access-token-cntt@811@";

/**
 * Middleware: Xác thực JWT từ cookie hoặc Authorization header
 */
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    debug("❌ Không có token.");
    return res.redirect('/auth'); // Web: redirect về trang đăng nhập
    // return res.status(401).json({ message: "Bạn chưa đăng nhập." }); // API mode
  }

  try {
    const decoded = await jwtHelper.verifyToken(token, accessTokenSecret);
    debug("✅ Token hợp lệ:", decoded);
    req.user = decoded.data;
    next();
  } catch (err) {
    debug("❌ Token không hợp lệ:", err.message);
    return res.redirect('/auth');
    // return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

/**
 * Middleware: Chỉ cho phép người dùng role "admin"
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth');
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' });
  }

  next();
};

/**
 * Middleware: Cho phép kiểm tra theo vai trò tùy chỉnh
 * Ví dụ: requireRole('editor'), requireRole('manager')
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth');
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: `Bạn cần quyền ${role} để truy cập.` });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireRole,
};
