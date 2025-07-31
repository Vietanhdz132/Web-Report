const { getCollection } = require('../../config/db/mongoClient');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

const SALT_ROUNDS = 10;

class UserModel {
  static async hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  static isSuperAdmin(user) {
    return user && user.role === 'admin';
  }

  static getPermissions(role, customPermissions = {}) {
    const defaultPermissions = {
      admin: {
        canManageUsers: true,
        canViewReports: true,
        canCreateReports: true,
        canEditReports: true,
        canDeleteReports: true,
      },
      manager: {
        canManageUsers: false,
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

  static async createUser(userData, currentUser) {
    if (!currentUser?.permissions?.canManageUsers || !UserModel.isSuperAdmin(currentUser)) {
      throw new Error('Không có quyền tạo người dùng');
    }

    const col = getCollection('users');
    const existingUser = await col.findOne({ username: userData.username });
    if (existingUser) throw new Error('Username đã tồn tại');

    const hashedPassword = await UserModel.hashPassword(userData.password);
    const now = new Date();

    const user = {
      name: userData.name,
      shortName: userData.shortName,
      username: userData.username,
      password: hashedPassword,
      email: userData.email,
      phone: userData.phone,
      birthDay: userData.birthDay,
      role: userData.role || 'view',
      department: userData.department || '',
      clan: userData.clan || '',
      position: userData.position || '',
      permissions: UserModel.getPermissions(userData.role, userData.permissions),
      createdAt: now,
      updatedAt: now,
    };

    const result = await col.insertOne(user);
    return result.insertedId;
  }

  static async updateUser(id, updateData, currentUser) {
    const col = getCollection('users');
    if (!ObjectId.isValid(id)) throw new Error('Invalid user id');

    const userToUpdate = await col.findOne({ _id: new ObjectId(id) });
    if (!userToUpdate) throw new Error('User không tồn tại');

    const isSelf = currentUser._id.toString() === id.toString();

    if (!isSelf) {
      // Chỉ cho phép user có quyền quản lý mới được sửa người khác
      if (!currentUser?.permissions?.canManageUsers) {
        throw new Error('Bạn không có quyền cập nhật người dùng');
      }

      // Nếu là manager thì chỉ được sửa user cùng phòng ban
      if (currentUser.role === 'manager' && currentUser.department !== userToUpdate.department) {
        throw new Error('Bạn chỉ được phép chỉnh sửa user cùng phòng ban');
      }
    } else {
      // Nếu sửa chính mình thì không được phép cập nhật username và role
      if ('username' in updateData) delete updateData.username;
      if ('role' in updateData) delete updateData.role;
    }

    const now = new Date();
    const updateFields = { ...updateData, updatedAt: now };

    if (updateFields.password) {
      updateFields.password = await UserModel.hashPassword(updateFields.password);
    }

    if (updateFields.role) {
      // Chỉ super admin mới được đặt role admin
      if (updateFields.role === 'admin' && !UserModel.isSuperAdmin(currentUser)) {
        throw new Error('Chỉ super admin mới có thể đặt role admin');
      }
      updateFields.permissions = UserModel.getPermissions(updateFields.role, updateFields.permissions);
    }

    const result = await col.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
    return result.matchedCount > 0;
  }


  static async deleteUser(id, currentUser) {
    if (!currentUser?.permissions?.canManageUsers) {
      throw new Error('Bạn không có quyền xoá người dùng');
    }

    const col = getCollection('users');
    if (!ObjectId.isValid(id)) throw new Error('Invalid user id');

    const userToDelete = await col.findOne({ _id: new ObjectId(id) });
    if (!userToDelete) throw new Error('User không tồn tại');

    if (currentUser.role === 'manager' && currentUser.department !== userToDelete.department) {
      throw new Error('Bạn chỉ được phép xóa user cùng phòng ban');
    }

    const result = await col.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  static async getUserByUsername(username) {
    const col = getCollection('users');
    return await col.findOne({ username });
  }

  static async getUserById(id) {
    if (!ObjectId.isValid(id)) return null;
    const col = getCollection('users');
    return await col.findOne({ _id: new ObjectId(id) });
  }

  static async verifyPassword(user, password) {
    if (!user) return false;
    return await bcrypt.compare(password, user.password);
  }

  static async getCurrentUser(userId) {
    if (!userId || !ObjectId.isValid(userId)) return null;
    const col = getCollection('users');
    return await col.findOne({ _id: new ObjectId(userId) });
  }

  static async initDefaultAdmin() {
    const col = getCollection('users');
    const existingAdmin = await col.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const now = new Date();
      const defaultAdmin = {
        name:'Super sup admin',
        username: 'password',
        password: await UserModel.hashPassword('admin'),
        email: 'admin@example.com',
        role: 'admin',
        department: 'IT',
        position: 'Super Admin',
        permissions: UserModel.getPermissions('admin'),
        createdAt: now,
        updatedAt: now,
      };
      await col.insertOne(defaultAdmin);
      console.log('Created default admin account: password/admin');
    }
  }

  static async getAllAccounts() {
    const col = getCollection('users');
    return await col.find({}).sort({ createdAt: -1 }).toArray();
  }

  static async getAccountsByDepartment(department) {
    const col = getCollection('users');
    return await col.find({ department }).sort({ createdAt: -1 }).toArray();
  }

  static async getAccountsByDateRange(start, end) {
    const col = getCollection('users');
    const startDate = new Date(start);
    const endDate = new Date(end);
    return await col.find({ createdAt: { $gte: startDate, $lte: endDate } }).sort({ createdAt: -1 }).toArray();
  }

  static async updateSelf(userId, updateData) {
    if (!ObjectId.isValid(userId)) {
      throw new Error('ID không hợp lệ');
    }

    const allowedFields = ['name', 'shortName', 'email', 'phone', 'birthDay', 'position', 'department'];
    const updateFields = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    }

    updateFields.updatedAt = new Date();

    const col = getCollection('users');
    const result = await col.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );

    return result.matchedCount > 0;
  }

  

}

module.exports = UserModel;
