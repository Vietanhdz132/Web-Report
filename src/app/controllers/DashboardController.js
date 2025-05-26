class DashboardController {
    // [GET] /testdata
    index(req, res) {
        res.render('dashboard', {
            layout: 'dashboardLayout', // Dùng layout phụ
            title: 'Dashboard Page'
        });
    }
}

module.exports = new DashboardController();
