const { ObjectId } = require('mongodb');
const { getCollection } = require('../../../config/db/mongoClient');

/**
 * Thêm báo cáo mới
 * @param {Object} reportData - Dữ liệu báo cáo đầy đủ
 * @returns {ObjectId} ID của báo cáo vừa thêm
 */
async function insertReport(reportData) {
  const col = getCollection('reports');

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
  const col = getCollection('reports');
  return await col.find({}).sort({ createdAt: -1 }).toArray();
}

/**
 * Lấy báo cáo theo ID
 */
async function getReportById(id) {
  if (!ObjectId.isValid(id)) return null;
  const col = getCollection('reports');
  return await col.findOne({ _id: new ObjectId(id) });
}

/**
 * Cập nhật báo cáo
 */
async function updateReport(id, updatedFields) {
  if (!ObjectId.isValid(id)) return 0;
  const col = getCollection('reports');
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
    const col = getCollection('reports');
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
  const col = getCollection('reports');
  return await col.find({ department }).sort({ createdAt: -1 }).toArray();
}

/**
 * Lấy báo cáo theo khoảng ngày (start, end là string 'YYYY-MM-DD')
 */
async function getReportsByDateRange(start, end) {
  const col = getCollection('reports');
  const startDate = new Date(start);
  const endDate = new Date(end);

  return await col.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).sort({ createdAt: -1 }).toArray();
}

 /**
 * Sao chép một báo cáo từ ID và trả về ID mới
 */
async function copyReport(id) {
  if (!ObjectId.isValid(id)) return null;
  const col = getCollection('reports');

  const original = await col.findOne({ _id: new ObjectId(id) });
  if (!original) return null;

  // Xóa _id và cập nhật các trường cần thiết
  const copied = { ...original };
  delete copied._id;
  copied.reportName = (copied.reportName || 'Báo cáo') + ' (Bản sao)';
  copied.createdAt = new Date(); // cập nhật thời gian mới

  const result = await col.insertOne(copied);
  return result.insertedId;
}

module.exports = {
  insertReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  getReportsByDepartment,
  getReportsByDateRange,
  copyReport
};
