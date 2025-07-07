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
    return res.redirect('/auth/login'); // Web: redirect về trang đăng nhập
  }

  try {
    const decoded = await jwtHelper.verifyToken(token, accessTokenSecret);
    // debug("✅ Token hợp lệ:", decoded);
    req.user = decoded.data; // chứa: _id, username, role, permissions, ...
    next();
  } catch (err) {
    // debug("❌ Token không hợp lệ:", err.message);
    return res.redirect('/auth/login');
  }
};

/**
 * Middleware: Chỉ cho phép người dùng role "admin"
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' });
  }

  next();
};

/**
 * Middleware: Kiểm tra quyền cụ thể trong user.permissions
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth/login');
    }

    if (!req.user.permissions || !req.user.permissions[permission]) {
      return res.status(403).json({ message: `Bạn không có quyền: ${permission}` });
    }

    next();
  };
};

/**
 * Middleware: Kiểm tra role cụ thể (nếu bạn vẫn cần)
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth/login');
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
  requirePermission,
};
