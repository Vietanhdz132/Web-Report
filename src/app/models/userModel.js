const { getCollection } = require('../../config/db/mongoClient');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Kiểm tra user có phải admin toàn hệ thống không
 * @param {Object} user 
 * @returns {Boolean}
 */
function isSuperAdmin(user) {
  return user && user.role === 'admin';
}

/**
 * Kiểm tra user có phải admin hoặc manager (phòng ban) không
 * @param {Object} user 
 * @returns {Boolean}
 */
function isAdminOrManager(user) {
  return user && (user.role === 'admin' || user.role === 'manager');
}

/**
 * Lấy quyền mặc định theo role
 */
function getPermissions(role, customPermissions = {}) {
  const defaultPermissions = {
    admin: {
      canManageUsers: true,
      canViewReports: true,
      canCreateReports: true,
      canEditReports: true,
      canDeleteReports: true,
    },
    manager: {
      canManageUsers: false, // manager không quản lý user toàn hệ thống
      canViewReports: true,
      canCreateReports: true,
      canEditReports: true,
      canDeleteReports: true,
    },
    view: {
      canManageUsers: false,
      canViewReports: true,
      canCreateReports: false,
      canEditReports: false,
      canDeleteReports: false,
    },
  };

  const rolePerms = defaultPermissions[role] || defaultPermissions.view;

  return { ...rolePerms, ...customPermissions };
}

/**
 * Tạo user mới (chỉ admin toàn hệ thống được tạo user)
 */
async function createUser(userData, currentUser) {
  if (!isSuperAdmin(currentUser)) throw new Error('Only super admin can create users');

  const col = getCollection('User');
  const now = new Date();

  // Kiểm tra username đã tồn tại chưa
  const existingUser = await col.findOne({ username: userData.username });
  if (existingUser) throw new Error('Username đã tồn tại');

  const hashedPassword = await hashPassword(userData.password);

  const user = {
    username: userData.username,
    password: hashedPassword,
    email: userData.email,
    role: userData.role || 'view',
    department: userData.department || '',
    position: userData.position || '',
    permissions: getPermissions(userData.role, userData.permissions),
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(user);
  return result.insertedId;
}

/**
 * Sửa thông tin user
 * - admin toàn hệ thống sửa được tất cả
 * - manager chỉ sửa được user cùng phòng
 */
async function updateUser(id, updateData, currentUser) {
  if (!isAdminOrManager(currentUser)) throw new Error('Only admin or manager can update users');

  const col = getCollection('User');
  if (!ObjectId.isValid(id)) throw new Error('Invalid user id');

  const userToUpdate = await col.findOne({ _id: new ObjectId(id) });
  if (!userToUpdate) throw new Error('User không tồn tại');

  // Nếu currentUser là manager thì chỉ được update user cùng phòng
  if (currentUser.role === 'manager' && currentUser.department !== userToUpdate.department) {
    throw new Error('Bạn chỉ được phép chỉnh sửa user cùng phòng ban');
  }

  const now = new Date();
  const updateFields = { ...updateData, updatedAt: now };

  if (updateFields.password) {
    updateFields.password = await hashPassword(updateFields.password);
  }

  // Cập nhật permissions theo role nếu thay đổi role
  if (updateFields.role) {
    if (updateFields.role === 'admin') {
      // Chỉ super admin mới được chuyển user thành admin toàn hệ thống
      if (!isSuperAdmin(currentUser)) {
        throw new Error('Chỉ super admin mới có thể đặt role admin');
      }
      updateFields.permissions = getPermissions('admin');
    } else {
      updateFields.permissions = getPermissions(updateFields.role, updateFields.permissions);
    }
  }

  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );

  return result.matchedCount > 0;
}

/**
 * Xóa user
 * - admin toàn hệ thống xóa được tất cả
 * - manager chỉ xóa được user cùng phòng
 */
async function deleteUser(id, currentUser) {
  if (!isAdminOrManager(currentUser)) throw new Error('Only admin or manager can delete users');

  const col = getCollection('User');
  if (!ObjectId.isValid(id)) throw new Error('Invalid user id');

  const userToDelete = await col.findOne({ _id: new ObjectId(id) });
  if (!userToDelete) throw new Error('User không tồn tại');

  if (currentUser.role === 'manager' && currentUser.department !== userToDelete.department) {
    throw new Error('Bạn chỉ được phép xóa user cùng phòng ban');
  }

  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

/**
 * Tìm user theo username
 */
async function getUserByUsername(username) {
  const col = getCollection('User');
  return await col.findOne({ username });
}

/**
 * Tìm user theo ID
 */
async function getUserById(id) {
  const col = getCollection('User');
  if (!ObjectId.isValid(id)) return null;
  return await col.findOne({ _id: new ObjectId(id) });
}

/**
 * Kiểm tra password đúng hay không
 */
async function verifyPassword(user, password) {
  if (!user) return false;
  return await bcrypt.compare(password, user.password);
}


async function initDefaultAdmin() {
  const col = getCollection('users');
  const existingAdmin = await col.findOne({ role: 'admin' });
  if (!existingAdmin) {
    const now = new Date();
    const defaultAdmin = {
      username: 'password',
      password: await hashPassword('admin'), // Mật khẩu mặc định, bạn đổi nếu cần
      email: 'admin@example.com',
      role: 'admin',
      department: 'IT',
      position: 'Super Admin',
      permissions: getPermissions('admin'),
      createdAt: now,
      updatedAt: now,
    };
    await col.insertOne(defaultAdmin);
    console.log('Created default admin account: password/admin');
  }
}


module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  initDefaultAdmin,
};
