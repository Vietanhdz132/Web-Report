const bcrypt = require("bcrypt");

async function testPassword(inputPassword, storedHashedPassword) {
    const isMatch = await bcrypt.compare(inputPassword, storedHashedPassword);
    console.log(`🔍 Kiểm tra mật khẩu "${inputPassword}":`, isMatch ? "✅ Đúng" : "❌ Sai");
}

async function runTest() {
    const password = "1";
    const hashedPassword = await bcrypt.hash(password, 10); // Dùng `await` để lấy giá trị đã hash
    console.log("🔐 Mật khẩu đã mã hóa:", hashedPassword); // Kiểm tra hash

    await testPassword("1", hashedPassword);
    await testPassword("abcdef", hashedPassword);
}

runTest();
