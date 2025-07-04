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

    Object.assign(alertDiv.style, {
        position: "fixed",
        top: "20px",
        right: "-400px", // bắt đầu ngoài màn hình
        zIndex: "1050",
        minWidth: "320px",
        maxWidth: "420px",
        padding: "15px 15px 15px 15px", // đủ padding để icon và nút đóng
        fontSize: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        borderRadius: "8px",
        backgroundColor: type === "success" ? "#d1e7dd" : (type === "warning" ? "#fff3cd" : "#f8d7da"),
        color: type === "success" ? "#0f5132" : (type === "warning" ? "#664d03" : "#842029"),
        transition: "right 0.5s ease-in-out, opacity 0.5s ease-in-out",
        display: "flex",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxSizing: "border-box",
        userSelect: "none",
    });

    // Icon nằm bên trái cố định
    const iconSpan = document.createElement("span");
    iconSpan.textContent = icon;
    Object.assign(iconSpan.style, {
        position: "absolute",
        left: "20px",
        fontSize: "24px",
        lineHeight: "1",
        userSelect: "none",
    });
    alertDiv.appendChild(iconSpan);

    // Nội dung message với margin-left cách icon
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    Object.assign(messageDiv.style, {
        marginLeft: "40px",
        flex: "1",
        lineHeight: "1.4",
    });
    alertDiv.appendChild(messageDiv);

    // Nút đóng nhỏ gọn góc phải trên
    // const closeBtn = document.createElement("button");
    // closeBtn.type = "button";
    // closeBtn.className = "btn-close";
    // closeBtn.setAttribute("aria-label", "Close");
    // closeBtn.onclick = () => alertDiv.remove();
    // alertDiv.appendChild(closeBtn);

    document.body.appendChild(alertDiv);

    // Hiệu ứng trượt vào
    setTimeout(() => {
        alertDiv.style.right = "20px";
        alertDiv.style.opacity = "1";
    }, 50);

    // Tự động ẩn sau 3s
    setTimeout(() => {
        alertDiv.style.right = "-400px";
        alertDiv.style.opacity = "0";
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}

