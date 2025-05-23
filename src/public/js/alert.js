function showAlert(message, type, title = "⚠️Warning") {
    // Xóa alert cũ nếu có
    const existingAlert = document.getElementById("customAlert");
    if (existingAlert) {
        existingAlert.remove();
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
        padding: "15px",
        fontSize: "16px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        backgroundColor: type === "success" ? "#d1e7dd" : "#f8d7da",
        color: type === "success" ? "#0f5132" : "#842029",
        transition: "right 0.5s ease-in-out, opacity 0.5s ease-in-out",
    });

    // Thêm nội dung cho alert
    alertDiv.innerHTML = `
        <div style="font-weight: bold; font-size: 18px; margin-bottom: 5px;">${title} !!!!</div>
        <div>${message}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

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
