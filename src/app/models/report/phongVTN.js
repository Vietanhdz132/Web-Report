const { ObjectId } = require('mongodb');
const { getCollection } = require('../../../config/db/mongoClient');

/**
 * Thêm báo cáo mới
 * @param {Object} reportData - Dữ liệu báo cáo (sections, title, department...)
 * @returns {ObjectId} ID của báo cáo vừa thêm
 */
async function insertReport(reportData) {
  const col = getCollection('Report');
  const result = await col.insertOne({
    ...reportData,
    createdAt: reportData.createdAt || new Date(), // Ngày tạo mặc định nếu không có
  });
  return result.insertedId;
}

/**
 * Lấy toàn bộ báo cáo, mới nhất trước
 */
async function getAllReports() {
  const col = getCollection('Report');
  return await col.find({}).sort({ createdAt: -1 }).toArray();
}

/**
 * Lấy báo cáo theo ID
 * @param {string} id - MongoDB ObjectId string
 */
async function getReportById(id) {
  const col = getCollection('Report');
  return await col.findOne({ _id: new ObjectId(id) });
}

/**
 * Cập nhật báo cáo
 * @param {string} id - MongoDB ObjectId string
 * @param {Object} updatedFields - Các trường muốn cập nhật
 */
async function updateReport(id, updatedFields) {
  const col = getCollection('Report');
  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedFields }
  );
  return result.modifiedCount;
}

/**
 * Xóa báo cáo
 * @param {string} id - MongoDB ObjectId string
 */
async function deleteReport(id) {
  const col = getCollection('Report');
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
}

/**
 * Lấy báo cáo theo phòng ban
 * @param {string} department - Tên phòng (ví dụ: "Phòng Vô Tuyến")
 */
async function getReportsByDepartment(department) {
  const col = getCollection('Report');
  return await col.find({ department }).sort({ createdAt: -1 }).toArray();
}

/**
 * Lấy báo cáo theo khoảng thời gian tạo
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 */
async function getReportsByDateRange(startDate, endDate) {
  const col = getCollection('Report');
  return await col.find({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ createdAt: -1 }).toArray();
}

module.exports = {
  insertReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  getReportsByDepartment,
  getReportsByDateRange
};
