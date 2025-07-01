const { ObjectId } = require('mongodb');
const { getCollection } = require('../../../config/db/mongoClient');

/**
 * Thêm báo cáo mới
 * @param {Object} reportData - Dữ liệu báo cáo đầy đủ
 * @returns {ObjectId} ID của báo cáo vừa thêm
 */
async function insertReport(reportData) {
  const col = getCollection('Report');

  const newReport = {
    reportName: reportData.reportName || 'Chưa đặt tên',
    recipient: reportData.recipient|| 'Chưa có',
    number: reportData.number || '',
    createdAt: reportData.createdAt ? new Date(reportData.createdAt) : new Date(),
    department: reportData.department ,
    sections: reportData.sections || {},
    receivers: reportData.receivers || '',
    signer: reportData.signer || '',
    position: reportData.position || ''
  };

  const result = await col.insertOne(newReport);
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
 */
async function getReportById(id) {
  if (!ObjectId.isValid(id)) return null;
  const col = getCollection('Report');
  return await col.findOne({ _id: new ObjectId(id) });
}

/**
 * Cập nhật báo cáo
 */
async function updateReport(id, updatedFields) {
  if (!ObjectId.isValid(id)) return 0;
  const col = getCollection('Report');
  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedFields }
  );
  return result.modifiedCount;
}

/**
 * Xoá báo cáo
 */
async function deleteReport(id) {
  if (!ObjectId.isValid(id)) return 0;
  try {
    const col = getCollection('Report');
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount;
  } catch (error) {
    console.error('Error deleting report:', error);
    return 0;
  }
}


/**
 * Lấy báo cáo theo phòng ban
 */
async function getReportsByDepartment(department) {
  const col = getCollection('Report');
  return await col.find({ department }).sort({ createdAt: -1 }).toArray();
}

/**
 * Lấy báo cáo theo khoảng ngày (start, end là string 'YYYY-MM-DD')
 */
async function getReportsByDateRange(start, end) {
  const col = getCollection('Report');
  const startDate = new Date(start);
  const endDate = new Date(end);

  return await col.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).sort({ createdAt: -1 }).toArray();
}

module.exports = {
  insertReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  getReportsByDepartment,
  getReportsByDateRange,
};
