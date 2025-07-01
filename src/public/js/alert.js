function showAlert(message, type) {
    // Xóa alert cũ nếu có
    const existingAlert = document.getElementById("customAlert");
    if (existingAlert) {
        existingAlert.remove();
    }

    // Icon theo type
    let icon = "";
    switch(type) {
        case "success":
            icon = "✔️";  // Tích xanh
            break;
        case "warning":
            icon = "⚠️";  // Tam giác chấm than
            break;
        case "danger":
        case "error":
            icon = "❗";  // Đèn cảnh báo hoặc chấm than to
            break;
        default:
            icon = "";    // Không có icon
    }

    // Tạo alert mới
    const alertDiv = document.createElement("div");
    alertDiv.id = "customAlert";
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;

    // Thiết lập CSS
    Object.assign(alertDiv.style, {
        position: "fixed",
        top: "20px",
        right: "-400px", // Bắt đầu ngoài màn hình
        zIndex: "1050",
        minWidth: "300px",
        maxWidth: "400px",
        padding: "15px 15px 15px 45px", // thêm padding trái cho icon
        fontSize: "16px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        backgroundColor: type === "success" ? "#d1e7dd" : (type === "warning" ? "#fff3cd" : "#f8d7da"),
        color: type === "success" ? "#0f5132" : (type === "warning" ? "#664d03" : "#842029"),
        transition: "right 0.5s ease-in-out, opacity 0.5s ease-in-out",
        position: "fixed",
        display: "flex",
        alignItems: "center",
    });

    // Tạo span chứa icon với style riêng
    const iconSpan = document.createElement("span");
    iconSpan.textContent = icon;
    Object.assign(iconSpan.style, {
        position: "absolute",
        left: "15px",
        fontSize: "22px",
        lineHeight: "1",
    });
    alertDiv.appendChild(iconSpan);

    // Thêm nội dung cho alert (bỏ phần title)
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    alertDiv.appendChild(messageDiv);

    // Nút đóng
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "btn-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.onclick = () => alertDiv.remove();
    alertDiv.appendChild(closeBtn);

    // Thêm vào body
    document.body.appendChild(alertDiv);

    // Kích hoạt hiệu ứng trượt vào màn hình
    setTimeout(() => {
        alertDiv.style.right = "20px"; // Trượt vào vị trí mong muốn
    }, 50);

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        alertDiv.style.right = "-400px"; // Trượt ra ngoài
        alertDiv.style.opacity = "0";
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}
