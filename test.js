// const ldap = require('ldapjs');

// const client = ldap.createClient({
//   url: 'ldap://10.2.19.99:389',
// });

// const username = 'anh.hoviet@mobifone.vn';
// const password = 'Hva132002';

// client.bind(username, password, (err) => {
//   if (err) {
//     console.error('Đăng nhập thất bại:', err.message);
//     client.unbind();
//     return;
//   }

//   console.log('Đăng nhập thành công!');

//   const baseDN = 'dc=mobifone,dc=vn';
//   const opts = {
//     scope: 'sub',
//     filter: `(userPrincipalName=${username})`,
//   };

//   client.search(baseDN, opts, (err, res) => {
//     if (err) {
//       console.error('Lỗi khi tìm kiếm:', err.message);
//       client.unbind();
//       return;
//     }

//     res.on('searchEntry', (entry) => {
//       console.log('Thông tin user:', entry.toObject());
//     });

//     res.on('error', (err) => {
//       console.error('Lỗi trong quá trình tìm kiếm:', err.message);
//     });

//     res.on('end', (result) => {
//       console.log('Tìm kiếm kết thúc, status:', result.status);
//       client.unbind();
//     });
//   });
// });


const mongoose = require('mongoose');
const XLSX = require('xlsx');

// Định nghĩa quyền mặc định
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

mongoose.connect('mongodb://localhost:27017/WeelyReport', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const ExcelDataSchema = new mongoose.Schema({}, { strict: false, versionKey: false });
const ExcelData = mongoose.model('users', ExcelDataSchema);

const workbook = XLSX.readFile('src/data/acc.xlsx');
const sheetName = workbook.SheetNames[0];
const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

const data = rawData.map(row => {
  if (!row.permissions || Object.keys(row.permissions).length === 0) {
    const role = row.role?.toLowerCase();
    row.permissions = defaultPermissions[role] || {};
  }
  row.createdAt = new Date();
  row.updatedAt = null;
  return row;
});

ExcelData.insertMany(data)
  .then(() => {
    console.log('Ghi dữ liệu thành công!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Lỗi khi ghi dữ liệu:', err);
    mongoose.disconnect();
  });
