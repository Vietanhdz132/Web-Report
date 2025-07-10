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
        top: "-100px",              // Bắt đầu ngoài màn hình (trên cùng)
        left: "50%",                // Căn giữa theo chiều ngang
        transform: "translateX(-50%)", // Căn giữa thực sự
        zIndex: "1050",
        minWidth: "320px",
        maxWidth: "420px",
        padding: "15px 15px 15px 15px",
        fontSize: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        borderRadius: "8px",
        backgroundColor: type === "success" ? "#d1e7dd" : (type === "warning" ? "#fff3cd" : "#f8d7da"),
        color: type === "success" ? "#0f5132" : (type === "warning" ? "#664d03" : "#842029"),
        transition: "top 0.5s ease, opacity 0.5s ease",
        display: "flex",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxSizing: "border-box",
        userSelect: "none",
        opacity: "0",
    });

    // Thanh tiến trình đáy
    const progressBar = document.createElement("div");
    Object.assign(progressBar.style, {
        position: "absolute",
        bottom: "0",
        left: "0",
        height: "4px",
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.1)",
    });

    const progress = document.createElement("div");
    Object.assign(progress.style, {
        height: "100%",
        width: "100%",
        backgroundColor: type === "success" ? "#198754" : (type === "warning" ? "#ffc107" : "#dc3545"),
        transition: "width 2s linear",
    });
    progressBar.appendChild(progress);
    alertDiv.appendChild(progressBar);

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

    document.body.appendChild(alertDiv);

    // Hiệu ứng trượt vào
    // Hiệu ứng trượt từ trên xuống
    setTimeout(() => {
        alertDiv.style.top = "20px";
        alertDiv.style.opacity = "1";
        progress.style.width = "0%";  // Bắt đầu giảm dần chiều rộng

    }, 50);

    // Tự động ẩn sau 3s
    setTimeout(() => {
        alertDiv.style.top = "-100px";
        alertDiv.style.opacity = "0";
        setTimeout(() => alertDiv.remove(), 500);
    }, 2000);

}

