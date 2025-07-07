const jwt = require("jsonwebtoken");

/**
 * Tạo token JWT với payload đã có sẵn
 * @param {Object} payload Dữ liệu sẽ được gói trong token dưới key 'data'
 * @param {string} secretSignature Khóa bí mật ký token
 * @param {string|number} tokenLife Thời gian sống của token, ví dụ '1h', '7d'
 * @returns {Promise<string>} Token JWT
 */
const generateToken = (payload, secretSignature, tokenLife) => {
  return new Promise((resolve, reject) => {


    jwt.sign(
      { data: payload },
      secretSignature,
      {
        algorithm: "HS256",
        expiresIn: tokenLife,
      },
      (error, token) => {
        if (error) {
          return reject(error);
        }
        resolve(token);
      }
    );
  });
};

/**
 * Giải mã và xác thực token JWT
 * @param {string} token Token JWT
 * @param {string} secretKey Khóa bí mật ký token
 * @returns {Promise<Object>} Dữ liệu decode được
 */
const verifyToken = (token, secretKey) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return reject(error);
      }
      resolve(decoded);
    });
  });
};

module.exports = {
  generateToken,
  verifyToken,
};
